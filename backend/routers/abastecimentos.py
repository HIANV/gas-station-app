from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database.database import get_db
from backend.models.abastecimento import Abastecimento
from backend.models.schemas import AbastecimentoCreate, AbastecimentoResponse

router = APIRouter(
    prefix="/abastecimentos",
    tags=["abastecimentos"]
)

@router.post("/", response_model=AbastecimentoResponse, status_code=201)
def criar_abastecimento(abastecimento: AbastecimentoCreate, db: Session = Depends(get_db)):
    # Regra de negócio: cálculo automático do valor total (Litros * Preço)
    valor_calculado = abastecimento.litros * abastecimento.preco_litro
    
    novo_abastecimento = Abastecimento(
        data_abastecimento=abastecimento.data_abastecimento,
        odometro=abastecimento.odometro,
        litros=abastecimento.litros,
        preco_litro=abastecimento.preco_litro,
        valor_total=valor_calculado,
        tipo_combustivel=abastecimento.tipo_combustivel,
        posto_nome=abastecimento.posto_nome
    )
    
    db.add(novo_abastecimento)
    db.commit()
    db.refresh(novo_abastecimento)
    return novo_abastecimento

@router.get("/", response_model=List[AbastecimentoResponse])
def listar_abastecimentos(db: Session = Depends(get_db)):
    # Retorna o histórico ordenado pela data decrescente (mais recentes primeiro)
    return db.query(Abastecimento).order_by(Abastecimento.data_abastecimento.desc()).all()

@router.get("/{id}", response_model=AbastecimentoResponse)
def obter_abastecimento(id: int, db: Session = Depends(get_db)):
    # Traz os detalhes de um registro específico pelo ID
    abastecimento = db.query(Abastecimento).filter(Abastecimento.id == id).first()
    if not abastecimento:
        raise HTTPException(status_code=404, detail="Abastecimento não encontrado")
    return abastecimento

@router.delete("/{id}", status_code=204)
def deletar_abastecimento(id: int, db: Session = Depends(get_db)):
    abastecimento = db.query(Abastecimento).filter(Abastecimento.id == id).first()
    if not abastecimento:
        raise HTTPException(status_code=404, detail="Abastecimento não encontrado")
    
    db.delete(abastecimento)
    db.commit()
    return None
