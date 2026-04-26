from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database.database import engine, Base
from backend.routers import abastecimentos

# Criação automática das tabelas baseadas nos modelos ORM
# (Pode ser removido caso opte por usar o arquivo SQL e uma ferramenta de migração como Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API de Gestão de Combustível",
    description="API para o aplicativo mobile de controle de abastecimentos",
    version="1.0.0"
)

# Habilitando CORS para permitir chamadas do frontend Angular/Ionic (localhost/dispositivo)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Ajuste na produção para os domínios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusão do router de abastecimentos
app.include_router(abastecimentos.router)

@app.get("/")
def raiz():
    return {"message": "API Backend em FastAPI rodando com sucesso!"}
