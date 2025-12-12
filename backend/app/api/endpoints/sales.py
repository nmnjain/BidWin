
import shutil
import os
from datetime import datetime
from fastapi import File, UploadFile, Form, HTTPException
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.sales_service import scan_mock_portal
from app.models import RFP

UPLOAD_DIR = "/app/data/manual_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)



router = APIRouter()

@router.post("/upload")
async def upload_manual_rfp(
    file: UploadFile = File(...),
    title: str = Form(...),
    client: str = Form(...),
    deadline: str = Form(...),
    db: Session = Depends(get_db)
):
    """
    Handles manual PDF uploads from the user.
    """
    try:
        # 1. Generate a safe filename
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        safe_filename = f"manual_{timestamp}_{file.filename.replace(' ', '_')}"
        file_path = os.path.join(UPLOAD_DIR, safe_filename)

        # 2. Save file to disk
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 3. Create DB Entry
        new_rfp = RFP(
            title=title,
            client_name=client,
            deadline=deadline,
            file_url=file_path, # Saves the internal Docker path
            status="New",
            created_at=datetime.now()
        )
        db.add(new_rfp)
        db.commit()
        db.refresh(new_rfp)

        return {
            "status": "success",
            "message": "RFP Uploaded Successfully",
            "rfp_id": new_rfp.id,
            "file_url": file_path
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

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