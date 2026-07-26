from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from app.config import settings
from app.churn_model import churn_service
from app.workout_generator import workout_service
from app.database import engine, Base
from app.routers import auth_router, users_router, alunos_router, planos_router, pagamentos_router, relatorios_router, webhook_router, tenants_router

# Cria as tabelas ao iniciar (se não existirem)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuração de CORS para permitir requisições do Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router, prefix="/api/v1")
app.include_router(users_router.router, prefix="/api/v1")
app.include_router(alunos_router.router, prefix="/api/v1")
app.include_router(planos_router.router, prefix="/api/v1")
app.include_router(pagamentos_router.router, prefix="/api/v1")
app.include_router(relatorios_router.router, prefix="/api/v1")
app.include_router(webhook_router.router, prefix="/api/v1")
app.include_router(tenants_router.router, prefix="/api/v1")

# === DTOs (Schemas de Dados) ===

class ChurnAnalysisRequest(BaseModel):
    aluno_id: str
    freq_semanal_media: float = Field(..., ge=0, le=7, description="Média de dias frequentados por semana")
    dias_sem_frequentar: int = Field(..., ge=0, description="Dias consecutivos sem ir à academia")
    idade: int = Field(..., ge=10, le=120)
    meses_matricula: int = Field(..., ge=0)
    pagamentos_atrasados: int = Field(..., ge=0)

class ChurnAnalysisResponse(BaseModel):
    aluno_id: str
    probabilidade_churn: float
    nivel_risco: str
    acao_recomendada: str

class WorkoutGeneratorRequest(BaseModel):
    aluno_id: str
    objetivo: str = Field(..., example="hipertrofia")
    nivel: str = Field(..., example="intermediario")
    dias_por_semana: int = Field(..., ge=1, le=7)
    restricoes: Optional[List[str]] = Field(default=[], example=["joelho"])

# === Endpoints REST ===

@app.get("/")
def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME, "version": settings.VERSION}

@app.post(f"{settings.API_PREFIX}/ia/churn/predicao", response_model=ChurnAnalysisResponse)
def predict_churn(payload: ChurnAnalysisRequest):
    try:
        resultado = churn_service.predict_risk(
            freq_semanal=payload.freq_semanal_media,
            dias_sem_frequentar=payload.dias_sem_frequentar,
            idade=payload.idade,
            meses_matricula=payload.meses_matricula,
            atrasos=payload.pagamentos_atrasados
        )
        return {
            "aluno_id": payload.aluno_id,
            **resultado
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.post(f"{settings.API_PREFIX}/ia/treino/gerar")
def generate_workout(payload: WorkoutGeneratorRequest):
    try:
        resultado = workout_service.generate(
            objetivo=payload.objetivo,
            nivel=payload.nivel,
            restricoes=payload.restricoes,
            dias_por_semana=payload.dias_por_semana
        )
        return {
            "aluno_id": payload.aluno_id,
            "prescricao": resultado
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
