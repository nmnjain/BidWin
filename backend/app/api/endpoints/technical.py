from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.technical_agent import analyze_rfp_technical

router = APIRouter()

@router.post("/{rfp_id}/analyze")
def run_technical_analysis(rfp_id: int, db: Session = Depends(get_db)):
    """
    Triggers the AI to read PDF -> Extract Specs -> Match Product
    """
    result = analyze_rfp_technical(rfp_id, db)
    return result