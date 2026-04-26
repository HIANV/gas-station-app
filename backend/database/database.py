import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

# Carrega as variáveis do arquivo .env (onde colocamos a URL do Neon)
load_dotenv()

# Tenta pegar do ambiente (Nuvem/Local Seguro), ou cai pro SQLite como backup
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./gas_station.db")

# O check_same_thread é específico do SQLite. O PostgreSQL não usa isso.
connect_args = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependência do FastAPI para obter a sessão do banco de dados
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
