from sqlalchemy.orm import Session
from app.models import Product

def seed_products(db: Session):
    # Check if products exist to avoid duplicates on restart
    if db.query(Product).first():
        return

    products = [
        # --- EPOXY & PRIMERS ---
        Product(
            sku="AP-IND-001",
            name="Asian Paints Apcodur 530",
            description="High build epoxy coating for steel and concrete structural protection.",
            base_price=450.0,
            specs={
                "base": "Epoxy",
                "finish": "Glossy",
                "dft": "100-150 microns",
                "application": "Airless Spray",
                "type": "Coating"
            }
        ),
        Product(
            sku="AP-IND-002",
            name="Asian Paints Berger Epilux 4",
            description="High performance anti-corrosive coating for pipelines and chemical plants.",
            base_price=620.0,
            specs={
                "base": "Epoxy Phenolic",
                "resistance": "Chemical & Acid",
                "dft": "200 microns",
                "temp_limit": "120C",
                "type": "Pipeline Coating"
            }
        ),
        Product(
            sku="AP-IND-004",
            name="Apcosil 605 Zinc Ethyl Silicate",
            description="Inorganic zinc silicate primer for high-performance corrosion protection.",
            base_price=890.0,
            specs={
                "base": "Zinc Silicate",
                "solids": "85% Zinc",
                "application": "Spray",
                "temp_limit": "400C",
                "type": "Primer"
            }
        ),
        Product(
            sku="AP-IND-005",
            name="Apcodur CP 682",
            description="Epoxy Zinc Phosphate Primer for steel structures in corrosive environments.",
            base_price=380.0,
            specs={
                "base": "Epoxy",
                "pigment": "Zinc Phosphate",
                "finish": "Matt",
                "dft": "50-75 microns",
                "type": "Primer"
            }
        ),
        
        # --- POLYURETHANE (PU) TOPCOATS ---
        Product(
            sku="AP-IND-003",
            name="Apcothane CF 675",
            description="Aliphatic Polyurethane topcoat for excellent UV resistance and color retention.",
            base_price=850.0,
            specs={
                "base": "Polyurethane (PU)",
                "finish": "High Gloss",
                "uv_resistance": "Excellent",
                "type": "Topcoat"
            }
        ),
        Product(
            sku="AP-IND-006",
            name="Apcothane 660",
            description="Semi-gloss polyurethane finish for bridges and infrastructure.",
            base_price=780.0,
            specs={
                "base": "Polyurethane",
                "finish": "Semi-Gloss",
                "solids": "60%",
                "type": "Topcoat"
            }
        ),

        # --- HEAT RESISTANT ---
        Product(
            sku="AP-IND-007",
            name="Apcoheat 600",
            description="Silicone Aluminium paint for stacks and chimneys operating up to 600°C.",
            base_price=1200.0,
            specs={
                "base": "Silicone",
                "pigment": "Aluminium",
                "temp_limit": "600C",
                "type": "Heat Resistant"
            }
        ),
        Product(
            sku="AP-IND-008",
            name="Apcoheat 200",
            description="Modified alkyd aluminium paint for medium heat (up to 200°C).",
            base_price=350.0,
            specs={
                "base": "Modified Alkyd",
                "temp_limit": "200C",
                "finish": "Metallic",
                "type": "Heat Resistant"
            }
        ),

        # --- HEAVY DUTY & SPECIALTY ---
        Product(
            sku="AP-IND-009",
            name="Epiglass 100",
            description="Glass flake reinforced epoxy for extreme abrasion and corrosion resistance.",
            base_price=1450.0,
            specs={
                "base": "Epoxy Glass Flake",
                "abrasion_resistance": "Extreme",
                "dft": "400-500 microns",
                "application": "Trowel/Spray",
                "type": "Heavy Duty"
            }
        ),
        Product(
            sku="AP-IND-010",
            name="Apcodur 220 Coal Tar Epoxy",
            description="High build coal tar epoxy for underwater and underground pipelines.",
            base_price=320.0,
            specs={
                "base": "Coal Tar Epoxy",
                "water_resistance": "Immersion Grade",
                "color": "Black",
                "type": "Underground/Marine"
            }
        ),
        
        # --- FLOORING & ROAD ---
        Product(
            sku="AP-IND-011",
            name="Apcoflor SL 2",
            description="Self-leveling epoxy flooring for pharmaceutical and clean room industries.",
            base_price=950.0,
            specs={
                "base": "Epoxy",
                "type": "Self Leveling",
                "thickness": "2mm - 3mm",
                "finish": "Smooth Glossy"
            }
        ),
        Product(
            sku="AP-IND-012",
            name="Apcomark Thermoplastic",
            description="Hot melt retro-reflective thermoplastic road marking paint.",
            base_price=150.0,
            specs={
                "base": "Thermoplastic",
                "application_temp": "180C",
                "drying_time": "<10 mins",
                "type": "Road Marking"
            }
        ),

        # --- MARINE & OFFSHORE (PPG SERIES) ---
        Product(
            sku="AP-PPG-013",
            name="PPG SigmaCover 380",
            description="Universal epoxy anticorrosive primer/coating for ballast tanks.",
            base_price=700.0,
            specs={
                "base": "Epoxy",
                "marine_grade": "Yes",
                "solids": "70%",
                "type": "Marine"
            }
        ),
        Product(
            sku="AP-PPG-014",
            name="PPG SigmaShield 880",
            description="High build solvent-free epoxy coating for offshore splash zones.",
            base_price=1800.0,
            specs={
                "base": "Solvent Free Epoxy",
                "curing": "Fast Cure",
                "salt_spray": ">5000 hours",
                "type": "Offshore"
            }
        ),

        # --- ENAMELS & GENERAL ---
        Product(
            sku="AP-IND-015",
            name="Apcolite Premium Gloss Enamel",
            description="General purpose high gloss enamel for metal and wood.",
            base_price=280.0,
            specs={
                "base": "Alkyd",
                "finish": "High Gloss",
                "drying": "Air Dry",
                "type": "Enamel"
            }
        ),
        Product(
            sku="AP-IND-016",
            name="Apcoprene 74",
            description="Chlorinated rubber based paint for chemical resistance.",
            base_price=550.0,
            specs={
                "base": "Chlorinated Rubber",
                "resistance": "Acid/Alkali fumes",
                "finish": "Semi-Gloss",
                "type": "Chemical Resistant"
            }
        ),

        # --- CONCRETE PROTECTION ---
        Product(
            sku="AP-IND-017",
            name="Asian Paints Anti-Carbonation Coating",
            description="Protective coating for concrete bridges to prevent carbonation.",
            base_price=480.0,
            specs={
                "base": "Acrylic",
                "feature": "Anti-Carbonation",
                "elongation": ">300%",
                "type": "Civil Protection"
            }
        ),
        Product(
            sku="AP-IND-018",
            name="SmartCare Damp Proof",
            description="Fiber reinforced elastomeric liquid waterproofing membrane.",
            base_price=300.0,
            specs={
                "base": "Acrylic Elastomeric",
                "waterproofing": "7 Bar Pressure",
                "type": "Waterproofing"
            }
        ),

        # --- FOOD GRADE & TANK LINING ---
        Product(
            sku="AP-IND-019",
            name="Apcodur 400 Food Grade",
            description="Solvent-free epoxy suitable for contact with potable water and food stuff.",
            base_price=1100.0,
            specs={
                "base": "Solvent Free Epoxy",
                "certification": "CFTRI Approved",
                "type": "Food Grade"
            }
        ),
        Product(
            sku="AP-IND-020",
            name="Apcolite Hammerstone Finish",
            description="Decorative hammer pattern finish for machinery and instruments.",
            base_price=310.0,
            specs={
                "finish": "Hammered Pattern",
                "base": "Synthetic Enamel",
                "type": "Industrial Finish"
            }
        )
    ]
    
    db.add_all(products)
    db.commit()
    print("✅ Seeded 20+ Mock Asian Paints Products into Database")