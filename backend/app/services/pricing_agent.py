from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified 
from app.models import RFP, Product

def calculate_pricing(rfp_id: int, db: Session):
    rfp = db.query(RFP).filter(RFP.id == rfp_id).first()
    if not rfp or not rfp.extracted_data:
        return {"error": "Data not found"}

    data = dict(rfp.extracted_data)
    
    if "line_items" not in data:
        return {"error": "Old data format. Please re-run Technical Analysis."}

    line_items = data["line_items"]
    commercial_lines = []
    grand_total = 0.0

    for line in line_items:
        match = line.get("match")
        if not match: continue

        product = db.query(Product).filter(Product.id == match["product_id"]).first()
        if not product: continue
        
        base_price = product.base_price
        
        qty_str = str(line["requirement"].get("quantity", "1"))
        try:
            import re
            nums = re.findall(r"[-+]?\d*\.\d+|\d+", qty_str)
            qty = float(nums[0]) if nums else 1.0
        except:
            qty = 1.0

        
        line_base = base_price * qty
        logistics = line_base * 0.05
        margin = line_base * 0.20
        gst = (line_base + logistics + margin) * 0.18
        line_total = line_base + logistics + margin + gst
        
        grand_total += line_total

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

    
    data["commercial"] = {
        "lines": commercial_lines,
        "grand_total_inr": round(grand_total, 2),
        "currency": "INR"
    }
    
    rfp.extracted_data = data
    flag_modified(rfp, "extracted_data") 
    
    rfp.status = "Pricing Complete"
    db.commit()

    return {
        "status": "success",
        "grand_total": round(grand_total, 2),
        "line_items": len(commercial_lines)
    }