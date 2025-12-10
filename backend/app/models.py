from sqlalchemy import Column, Integer, String, DateTime, JSON, Text, Float
from sqlalchemy.sql import func
from app.core.database import Base

class RFP(Base):
    __tablename__ = "rfps"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    client_name = Column(String)
    file_url = Column(String) # Path to the PDF
    status = Column(String, default="New") # New, In Progress, Ready, Submitted
    deadline = Column(String)
    
    extracted_data = Column(JSON, nullable=True) 
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, unique=True, index=True)
    name = Column(String)
    description = Column(Text)
    base_price = Column(Float)
    
    specs = Column(JSON)