from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.sales_service import scan_mock_portal
from app.models import RFP

router = APIRouter()

@router.post("/scan")
def trigger_scan(db: Session = Depends(get_db)):
    """
    Triggers the Sales Agent to scan the portal and save new RFPs.
    """
    result = scan_mock_portal(db)
    return result

@router.get("/rfps")
def list_rfps(db: Session = Depends(get_db)):
    """
    List all RFPs in the database.
    """
    rfps = db.query(RFP).all()
    return rfps