from sqlalchemy.orm import Session
from app.models import RFP, Product

def calculate_pricing(rfp_id: int, db: Session):
    # 1. Fetch RFP
    rfp = db.query(RFP).filter(RFP.id == rfp_id).first()
    if not rfp:
        return {"error": "RFP not found"}
    
    # 2. Check if Technical Analysis is done
    if not rfp.extracted_data or "match" not in rfp.extracted_data:
        return {"error": "Technical analysis not completed yet. Run Phase 2 first."}

    # 3. Get the Matched Product ID
    try:
        match_data = rfp.extracted_data["match"]
        product_id = match_data.get("product_id")
        
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return {"error": f"Matched product ID {product_id} not found in inventory."}

        # 4. Perform Pricing       
        
        base_price = product.base_price
        
        logistics_cost = base_price * 0.05  
        
        # Logic: Standard GST
        gst_rate = 0.18
        gst_amount = (base_price + logistics_cost) * gst_rate
        
        
        margin_percent = 0.20
        margin_amount = base_price * margin_percent

        final_unit_price = base_price + logistics_cost + gst_amount + margin_amount

        pricing_breakdown = {
            "sku": product.sku,
            "product_name": product.name,
            "currency": "INR",
            "unit": "Per Litre",
            "components": {
                "base_price": round(base_price, 2),
                "logistics_5_percent": round(logistics_cost, 2),
                "margin_20_percent": round(margin_amount, 2),
                "gst_18_percent": round(gst_amount, 2)
            },
            "final_unit_price": round(final_unit_price, 2)
        }

        # 5. Save to DB (Update extracted_data)
        current_data = dict(rfp.extracted_data)
        current_data["pricing"] = pricing_breakdown
        
        rfp.extracted_data = current_data
        rfp.status = "Pricing Complete"
        db.commit()

        return {
            "status": "success",
            "rfp_id": rfp.id,
            "pricing": pricing_breakdown
        }

    except Exception as e:
        return {"error": f"Pricing calculation failed: {str(e)}"}