import json
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
    """Helper to remove markdown code blocks often added by Gemini"""
    if "```json" in json_str:
        json_str = json_str.split("```json")[1].split("```")[0]
    elif "```" in json_str:
        json_str = json_str.split("```")[1].split("```")[0]
    return json_str.strip()

def analyze_rfp_technical(rfp_id: int, db: Session):
    # 1. Fetch RFP
    rfp = db.query(RFP).filter(RFP.id == rfp_id).first()
    if not rfp:
        return {"error": "RFP not found"}

    # 2. Extract Text
    rfp_text = extract_text_from_pdf(rfp.file_url)
    if not rfp_text:
        return {"error": "Could not read PDF file"}
        
    # Pass first 10k chars
    rfp_text_snippet = rfp_text[:10000]

    # 3. AI Extraction Step
    extraction_prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert technical sales engineer. Extract the key technical requirements from this tender text into JSON format. keys: material_type, dft_requirement, application_method, standards."),
        ("user", "{text}")
    ])
    
    chain = extraction_prompt | llm
    
    try:
        response = chain.invoke({"text": rfp_text_snippet})
        extracted_specs_str = clean_json_string(response.content)
    except Exception as e:
        return {"error": f"Gemini Extraction failed: {str(e)}"}

    # 4. Match Logic
    all_products = db.query(Product).all()
    # Create a compact string of products to save tokens
    product_list_str = "\n".join([f"ID:{p.id}|Name:{p.name}|Specs:{p.specs}" for p in all_products])
    
    matching_prompt = ChatPromptTemplate.from_messages([
        ("system", "Compare the RFP Requirements against the Available Products. Pick the best single product ID. Return ONLY JSON with no extra text: {{ 'product_id': 1, 'match_score': 85, 'reason': '...' }}"),
        ("user", "RFP Requirements JSON: {rfp_reqs}\n\nAvailable Products:\n{products}")
    ])
    
    match_chain = matching_prompt | llm
    
    try:
        match_res = match_chain.invoke({
            "rfp_reqs": extracted_specs_str,
            "products": product_list_str
        })
        
        # Parse JSON
        clean_match_json = clean_json_string(match_res.content)
        match_data = json.loads(clean_match_json)
        
        try:
            reqs_json = json.loads(extracted_specs_str)
        except:
            reqs_json = extracted_specs_str

        rfp.extracted_data = {
            "requirements": reqs_json,
            "match": match_data
        }
        rfp.status = "Processed"
        db.commit()
        
        return {
            "status": "success",
            "rfp_id": rfp.id,
            "extracted_requirements": reqs_json,
            "best_match": match_data
        }
    except Exception as e:
        return {
            "error": f"Parsing match result failed: {str(e)}", 
            "raw_response": match_res.content
        }