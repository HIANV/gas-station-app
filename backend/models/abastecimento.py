from sqlalchemy import Column, Integer, Float, String, Date
from backend.database.database import Base
from datetime import date

class Abastecimento(Base):
    __tablename__ = "abastecimentos"

    id = Column(Integer, primary_key=True, index=True)
    data_abastecimento = Column(Date, default=date.today)
    odometro = Column(Float, nullable=False)
    litros = Column(Float, nullable=False)
    preco_litro = Column(Float, nullable=False)
    valor_total = Column(Float, nullable=False)
    tipo_combustivel = Column(String, index=True)
    posto_nome = Column(String)
    veiculoId = Column(String, default="Moto", index=True)
