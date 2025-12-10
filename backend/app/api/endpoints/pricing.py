from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.pricing_agent import calculate_pricing

router = APIRouter()

@router.post("/{rfp_id}/calculate")
def run_pricing_logic(rfp_id: int, db: Session = Depends(get_db)):
    """
    Generates a commercial quote based on the technical match.
    """
    result = calculate_pricing(rfp_id, db)
    return result