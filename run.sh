#!/bin/bash
# Cria o ambiente virtual caso não exista
if [ ! -d "venv" ]; then
    echo "Criando ambiente virtual..."
    python3 -m venv venv
fi

# Ativa o ambiente virtual
source venv/bin/activate

# Instala as dependências
echo "Instalando dependências..."
pip install -r requirements.txt

# Inicia o servidor FastAPI com uvicorn
echo "Iniciando o servidor FastAPI..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
