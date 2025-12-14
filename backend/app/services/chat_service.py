from sqlalchemy.orm import Session
from app.models import RFP
from app.services.pdf_service import extract_text_from_pdf
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from app.core.config import settings

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GOOGLE_API_KEY,
    temperature=0.3, 
    convert_system_message_to_human=True
)

def chat_with_rfp(rfp_id: int, user_question: str, db: Session):
    rfp = db.query(RFP).filter(RFP.id == rfp_id).first()
    if not rfp: return {"error": "RFP not found"}

    pdf_text = extract_text_from_pdf(rfp.file_url)
    
    analysis_json = rfp.extracted_data or {}

    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are BidWin AI, an expert tender analyst. 
        You have access to the Tender Document (PDF) and the Internal Analysis (JSON).
        
        Answer the user's question accurately.
        - If asking about specs/clauses, cite the PDF text.
        - If asking about pricing/profit/matches, use the Internal Analysis JSON.
        - Keep answers concise and professional.
        """),
        ("human", """
        --- INTERNAL ANALYSIS (JSON) ---
        {analysis}
        
        --- PDF DOCUMENT EXCERPT ---
        {pdf_text}
        
        --- USER QUESTION ---
        {question}
        """)
    ])

    try:
        chain = prompt | llm
        response = chain.invoke({
            "analysis": str(analysis_json),
            "pdf_text": pdf_text[:30000], 
            "question": user_question
        })
        return {"response": response.content}
    except Exception as e:
        return {"error": f"Chat failed: {str(e)}"}