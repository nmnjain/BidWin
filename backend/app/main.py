from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api.endpoints import sales 
from app.services.seed_db import seed_products
from app.core.database import SessionLocal
from app.api.endpoints import sales, technical
from app.api.endpoints import sales, technical, pricing


Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)



# Register Routers
app.include_router(sales.router, prefix="/api/agents/sales", tags=["Sales Agent"])
app.include_router(technical.router, prefix="/api/agents/technical", tags=["Technical Agent"])

app.include_router(pricing.router, prefix="/api/agents/pricing", tags=["Pricing Agent"])

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        seed_products(db)
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "BidWin AI API Ready"}