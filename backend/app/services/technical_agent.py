import json
import re
from sqlalchemy.orm import Session
from app.models import RFP, Product
from app.services.pdf_service import extract_text_from_pdf
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from app.core.config import settings

# Initialize Gemini
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GOOGLE_API_KEY,
    temperature=0,
    convert_system_message_to_human=True
)

def clean_json_string(json_str: str) -> str:
    
    
    if "```json" in json_str:
        json_str = json_str.split("```json")[1].split("```")[0]
    elif "```" in json_str:
        json_str = json_str.split("```")[1].split("```")[0]
    return json_str.strip()

def calculate_keyword_score(req_text: str, product_text: str) -> int:
    
    def tokenize(text):
        return set(re.findall(r'\w+', str(text).lower()))

    req_tokens = tokenize(req_text)
    prod_tokens = tokenize(product_text)
    
    if not req_tokens: return 0
    
    intersection = req_tokens.intersection(prod_tokens)
    score = (len(intersection) / len(req_tokens)) * 100
    
    return min(int(score), 100)

def analyze_rfp_technical(rfp_id: int, db: Session):
    
    rfp = db.query(RFP).filter(RFP.id == rfp_id).first()
    if not rfp: return {"error": "RFP not found"}

    rfp_text = extract_text_from_pdf(rfp.file_url)
    if not rfp_text: return {"error": "Could not read PDF file"}
    
    extraction_prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert technical estimator. Analyze the tender document.
        
        TASK 1: Extract the 'Bill of Quantities' or 'Scope of Supply'.
        TASK 2: Extract 'Testing & Acceptance Requirements' (e.g., Type Test, Routine Test, Third Party Inspection).
        
        Return a JSON Object with two keys: "items" and "tests".
        
        Example JSON:
        {{
          "items": [
             {{ "item_name": "Anticorrosive Primer", "specs": "...", "quantity": "500 L" }}
          ],
          "tests": ["Salt Spray Test", "High Voltage Test", "Third Party Inspection"]
        }}
        """),
        ("user", "{text}")
    ])
    
    try:
        chain = extraction_prompt | llm
        response = chain.invoke({"text": rfp_text[:15000]})
        raw_data = json.loads(clean_json_string(response.content))
        
        # Handle formatting safety
        items_list = raw_data.get("items", [])
        extracted_tests = raw_data.get("tests", [])
        
        if not isinstance(items_list, list): items_list = [items_list]
        if not isinstance(extracted_tests, list): extracted_tests = [str(extracted_tests)]
            
    except Exception as e:
        return {"error": f"Extraction failed: {str(e)}"}

    all_products = db.query(Product).all()
    catalog_str = "\n".join([f"ID:{p.id}|Name:{p.name}|Desc:{p.description}|Specs:{p.specs}" for p in all_products])

    line_items_result = []

    for item in items_list:
        matching_prompt = ChatPromptTemplate.from_messages([
            ("system", """Find the best single product ID for this requirement.
            Also provide a 'semantic_score' (0-100) based on how well the technology matches.
            Return JSON: {{ "product_id": 1, "semantic_score": 90, "reason": "..." }}"""),
            ("user", "Requirement: {req_item}\n\nCatalog:\n{catalog}")
        ])
        
        try:
            match_res = (matching_prompt | llm).invoke({
                "req_item": str(item),
                "catalog": catalog_str
            })
            
            match_data = json.loads(clean_json_string(match_res.content))
            
            product = next((p for p in all_products if p.id == match_data.get('product_id')), None)
            
            if product:
                prod_text = f"{product.name} {product.description} {str(product.specs)}"
                req_text = f"{item.get('item_name')} {item.get('specs')}"
                
                keyword_score = calculate_keyword_score(req_text, prod_text)
                rule_score = 100 if match_data.get('semantic_score', 0) > 80 else 50
                
                ensemble_score = (
                    (match_data.get('semantic_score', 0) * 0.5) +
                    (keyword_score * 0.3) +
                    (rule_score * 0.2)
                )
                
                line_items_result.append({
                    "requirement": item,
                    "match": {
                        "product_id": product.id,
                        "product_name": product.name,
                        "sku": product.sku,
                        "reason": match_data.get('reason', 'Matched by AI'),
                        "scores": {
                            "ensemble": int(ensemble_score),
                            "semantic": match_data.get('semantic_score', 0),
                            "keyword": keyword_score,
                            "rule": rule_score
                        }
                    }
                })
            else:
                line_items_result.append({"requirement": item, "match": None, "error": "Product ID not found"})

        except Exception as inner_e:
            print(f"Error matching item {item}: {inner_e}")
            line_items_result.append({"requirement": item, "match": None, "error": str(inner_e)})
            continue

    rfp.extracted_data = {
        "line_items": line_items_result,
        "required_tests": extracted_tests, 
        "mode": "multi_sku"
    }
    rfp.status = "Processed"
    db.commit()

    return {
        "status": "success",
        "rfp_id": rfp.id,
        "item_count": len(line_items_result),
        "data": line_items_result
    }