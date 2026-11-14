from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models import Produto, MovimentacaoEstoque, User, RoleEnum
from app.auth import require_role

router = APIRouter(prefix="/estoque", tags=["Estoque"])

class ProdutoCreate(BaseModel):
    nome: str
    descricao: Optional[str] = None
    categoria: Optional[str] = None
    preco_compra: float = 0.0
    preco_venda: float = 0.0
    estoque_atual: int = 0
    estoque_minimo: int = 5
    unidade: str = "un"

class ProdutoUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    categoria: Optional[str] = None
    preco_compra: Optional[float] = None
    preco_venda: Optional[float] = None
    estoque_minimo: Optional[int] = None
    unidade: Optional[str] = None
    ativo: Optional[int] = None

class ProdutoResponse(BaseModel):
    id: int
    nome: str
    descricao: Optional[str]
    categoria: Optional[str]
    preco_compra: float
    preco_venda: float
    estoque_atual: int
    estoque_minimo: int
    unidade: str
    ativo: int
    created_at: datetime

    class Config:
        from_attributes = True

class MovimentacaoCreate(BaseModel):
    produto_id: int
    tipo: str  # "entrada" ou "saida"
    quantidade: int
    motivo: Optional[str] = None
    responsavel: Optional[str] = None

class MovimentacaoResponse(BaseModel):
    id: int
    produto_id: int
    produto_nome: str
    tipo: str
    quantidade: int
    motivo: Optional[str]
    responsavel: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class EstoqueBaixoResponse(BaseModel):
    id: int
    nome: str
    categoria: Optional[str]
    estoque_atual: int
    estoque_minimo: int
    unidade: str

    class Config:
        from_attributes = True


@router.post("/produtos", response_model=ProdutoResponse, status_code=status.HTTP_201_CREATED)
def create_produto(
    produto_in: ProdutoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN]))
):
    existente = db.query(Produto).filter(
        Produto.nome == produto_in.nome,
        Produto.tenant_id == current_user.tenant_id
    ).first()
    if existente:
        raise HTTPException(status_code=400, detail="Produto já existe")

    novo = Produto(**produto_in.model_dump(), tenant_id=current_user.tenant_id)
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo


@router.get("/produtos", response_model=List[ProdutoResponse])
def list_produtos(
    busca: Optional[str] = None,
    categoria: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.RECEP]))
):
    query = db.query(Produto).filter(Produto.tenant_id == current_user.tenant_id, Produto.ativo == 1)
    if busca:
        query = query.filter(Produto.nome.ilike(f"%{busca}%"))
    if categoria:
        query = query.filter(Produto.categoria == categoria)
    return query.order_by(Produto.nome).all()


@router.get("/produtos/{produto_id}", response_model=ProdutoResponse)
def get_produto(
    produto_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.RECEP]))
):
    produto = db.query(Produto).filter(
        Produto.id == produto_id,
        Produto.tenant_id == current_user.tenant_id
    ).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return produto


@router.put("/produtos/{produto_id}", response_model=ProdutoResponse)
def update_produto(
    produto_id: int,
    produto_in: ProdutoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN]))
):
    produto = db.query(Produto).filter(
        Produto.id == produto_id,
        Produto.tenant_id == current_user.tenant_id
    ).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    update_data = produto_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(produto, field, value)

    db.commit()
    db.refresh(produto)
    return produto


@router.delete("/produtos/{produto_id}")
def delete_produto(
    produto_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN]))
):
    produto = db.query(Produto).filter(
        Produto.id == produto_id,
        Produto.tenant_id == current_user.tenant_id
    ).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    db.delete(produto)
    db.commit()
    return {"message": "Produto excluído com sucesso"}


@router.post("/movimentacoes", response_model=MovimentacaoResponse, status_code=status.HTTP_201_CREATED)
def create_movimentacao(
    mov_in: MovimentacaoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.RECEP]))
):
    if mov_in.tipo not in ("entrada", "saida"):
        raise HTTPException(status_code=400, detail="Tipo deve ser 'entrada' ou 'saida'")

    if mov_in.quantidade <= 0:
        raise HTTPException(status_code=400, detail="Quantidade deve ser maior que zero")

    produto = db.query(Produto).filter(
        Produto.id == mov_in.produto_id,
        Produto.tenant_id == current_user.tenant_id
    ).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    if mov_in.tipo == "saida" and produto.estoque_atual < mov_in.quantidade:
        raise HTTPException(
            status_code=400,
            detail=f"Estoque insuficiente. Disponível: {produto.estoque_atual}"
        )

    if mov_in.tipo == "entrada":
        produto.estoque_atual += mov_in.quantidade
    else:
        produto.estoque_atual -= mov_in.quantidade

    mov = MovimentacaoEstoque(
        produto_id=mov_in.produto_id,
        tipo=mov_in.tipo,
        quantidade=mov_in.quantidade,
        motivo=mov_in.motivo,
        responsavel=mov_in.responsavel,
        tenant_id=current_user.tenant_id
    )
    db.add(mov)
    db.commit()
    db.refresh(mov)

    return {
        "id": mov.id,
        "produto_id": mov.produto_id,
        "produto_nome": produto.nome,
        "tipo": mov.tipo,
        "quantidade": mov.quantidade,
        "motivo": mov.motivo,
        "responsavel": mov.responsavel,
        "created_at": mov.created_at
    }


@router.get("/movimentacoes", response_model=List[MovimentacaoResponse])
def list_movimentacoes(
    produto_id: Optional[int] = None,
    tipo: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.RECEP]))
):
    query = db.query(MovimentacaoEstoque).filter(
        MovimentacaoEstoque.tenant_id == current_user.tenant_id
    )
    if produto_id:
        query = query.filter(MovimentacaoEstoque.produto_id == produto_id)
    if tipo:
        query = query.filter(MovimentacaoEstoque.tipo == tipo)

    movimentacoes = query.order_by(MovimentacaoEstoque.created_at.desc()).limit(200).all()

    resultado = []
    for m in movimentacoes:
        produto = db.query(Produto).filter(Produto.id == m.produto_id).first()
        resultado.append({
            "id": m.id,
            "produto_id": m.produto_id,
            "produto_nome": produto.nome if produto else "Desconhecido",
            "tipo": m.tipo,
            "quantidade": m.quantidade,
            "motivo": m.motivo,
            "responsavel": m.responsavel,
            "created_at": m.created_at
        })
    return resultado


@router.get("/baixo-estoque", response_model=List[EstoqueBaixoResponse])
def produtos_baixo_estoque(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.RECEP]))
):
    produtos = db.query(Produto).filter(
        Produto.tenant_id == current_user.tenant_id,
        Produto.ativo == 1,
        Produto.estoque_atual <= Produto.estoque_minimo
    ).order_by(Produto.estoque_atual).all()
    return produtos


@router.get("/resumo")
def resumo_estoque(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.RECEP]))
):
    produtos = db.query(Produto).filter(
        Produto.tenant_id == current_user.tenant_id,
        Produto.ativo == 1
    ).all()

    total_produtos = len(produtos)
    valor_total_estoque = sum(p.estoque_atual * p.preco_compra for p in produtos)
    valor_total_venda = sum(p.estoque_atual * p.preco_venda for p in produtos)
    produtos_baixo = sum(1 for p in produtos if p.estoque_atual <= p.estoque_minimo)
    produtos_zerados = sum(1 for p in produtos if p.estoque_atual == 0)

    categorias = {}
    for p in produtos:
        cat = p.categoria or "Sem categoria"
        if cat not in categorias:
            categorias[cat] = {"quantidade": 0, "valor_estoque": 0.0}
        categorias[cat]["quantidade"] += p.estoque_atual
        categorias[cat]["valor_estoque"] += p.estoque_atual * p.preco_compra

    return {
        "total_produtos": total_produtos,
        "valor_total_estoque": round(valor_total_estoque, 2),
        "valor_total_venda": round(valor_total_venda, 2),
        "produtos_baixo_estoque": produtos_baixo,
        "produtos_zerados": produtos_zerados,
        "por_categoria": categorias
    }
