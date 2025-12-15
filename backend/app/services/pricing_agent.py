import re
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from app.models import RFP, Product

# DUMMY SERVICE RATE CARD (As per Problem Statement)
SERVICE_RATE_CARD = {
    "Type Test": 15000.0,
    "Routine Test": 2000.0,
    "Acceptance Test": 5000.0,
    "High Voltage Test": 3000.0,
    "Salt Spray Test": 4500.0,
    "Third Party Inspection": 25000.0,
    "Factory Acceptance Test": 10000.0,
    "FAT": 10000.0
}

def calculate_pricing(rfp_id: int, db: Session):
    rfp = db.query(RFP).filter(RFP.id == rfp_id).first()
    if not rfp or not rfp.extracted_data:
        return {"error": "Data not found"}

    data = dict(rfp.extracted_data)
    
    if "line_items" not in data:
        return {"error": "Old data format. Please re-run Technical Analysis."}

    line_items = data["line_items"]
    commercial_lines = []
    
    for line in line_items:
        match = line.get("match")
        if not match: continue

        product = db.query(Product).filter(Product.id == match["product_id"]).first()
        if not product: continue
        
        base_price = product.base_price
        
        qty_str = str(line["requirement"].get("quantity", "1"))
        try:
            nums = re.findall(r"[-+]?\d*\.\d+|\d+", qty_str)
            qty = float(nums[0]) if nums else 1.0
        except:
            qty = 1.0

        line_base = base_price * qty
        logistics = line_base * 0.05
        margin = line_base * 0.20
        gst = (line_base + logistics + margin) * 0.18
        line_total = line_base + logistics + margin + gst
        
        commercial_lines.append({
            "item_name": line["requirement"]["item_name"],
            "sku": product.sku,
            "qty": qty,
            "unit_price": base_price,
            "line_total": round(line_total, 2),
            "breakdown": {
                "base": round(line_base, 2),
                "logistics": round(logistics, 2),
                "margin": round(margin, 2),
                "gst": round(gst, 2)
            }
        })

    extracted_tests = data.get("required_tests", [])
    
    if isinstance(extracted_tests, str):
        extracted_tests = [extracted_tests]
        
    service_lines = []
    total_service_cost = 0.0
    
    for test_name in extracted_tests:
        cost = 0.0
        matched_service = "Miscellaneous Testing"
        
        for key, rate in SERVICE_RATE_CARD.items():
            if key.lower() in str(test_name).lower():
                cost = rate
                matched_service = key
                break
        
        if cost == 0.0: 
            cost = 5000.0 
        
        total_service_cost += cost
        service_lines.append({
            "test_name": str(test_name),
            "matched_service": matched_service,
            "cost": cost
        })

    grand_total_products = sum(line['line_total'] for line in commercial_lines)
    grand_total_project = grand_total_products + total_service_cost

    data["commercial"] = {
        "lines": commercial_lines,           
        "services": service_lines,          
        "product_total": round(grand_total_products, 2),
        "service_total": round(total_service_cost, 2),
        "grand_total_inr": round(grand_total_project, 2),
        "currency": "INR"
    }
    
    rfp.extracted_data = data
    flag_modified(rfp, "extracted_data") 
    
    rfp.status = "Pricing Complete"
    db.commit()

    return {
        "status": "success",
        "grand_total": round(grand_total_project, 2),
        "line_items": len(commercial_lines),
        "tests_added": len(service_lines)
    }