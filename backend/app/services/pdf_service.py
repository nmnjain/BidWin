import os
from pypdf import PdfReader

def extract_text_from_pdf(file_path: str) -> str:
    """
    Reads a local PDF file and returns the text.
    """
    if not os.path.exists(file_path):
        return ""

    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return ""