from pydantic import BaseModel
from datetime import date
from typing import Optional

class AbastecimentoBase(BaseModel):
    data_abastecimento: date
    odometro: float
    litros: float
    preco_litro: float
    tipo_combustivel: str
    posto_nome: Optional[str] = None
    valor_total: Optional[float] = None
    veiculoId: str = "Moto"

class AbastecimentoCreate(AbastecimentoBase):
    pass

class AbastecimentoResponse(AbastecimentoBase):
    id: int
    valor_total: float

    class Config:
        # Habilita o modo ORM para ler dados de objetos do SQLAlchemy
        from_attributes = True
