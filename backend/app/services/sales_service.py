import os
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from app.models import RFP

DATA_DIR = "/app/data" 

def scan_mock_portal(db: Session):
    portal_path = os.path.join(DATA_DIR, "mock_portal.html")
    
    if not os.path.exists(portal_path):
        return {"error": "Mock portal file not found"}

    with open(portal_path, "r") as f:
        soup = BeautifulSoup(f, "html.parser")

    new_rfps = []
    tenders = soup.find_all("li", class_="tender-item")

    for item in tenders:
        title = item.find("h3", class_="title").text.strip()
        client = item.find("span", class_="client").text.strip()
        deadline = item.find("span", class_="deadline").text.strip()
        link = item.find("a", class_="download-link")['href']
        
        # Check duplication
        existing = db.query(RFP).filter(RFP.title == title).first()
        if not existing:
            # Create new RFP entry
            rfp = RFP(
                title=title,
                client_name=client,
                deadline=deadline,
                file_url=os.path.join(DATA_DIR, link), 
                status="New"
            )
            db.add(rfp)
            db.commit()
            db.refresh(rfp)
            new_rfps.append({"id": rfp.id, "title": rfp.title})

    return {
        "status": "success",
        "scanned_count": len(tenders),
        "new_rfps": new_rfps
    }