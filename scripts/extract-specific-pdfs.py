#!/usr/bin/env python3
import json
import os
import re
import fitz  # PyMuPDF
from typing import Optional

TOPIC_MAPPINGS = {
    "sequence": ("number", "sequences", 800),
    "pattern": ("number", "sequences", 800),
    "round": ("number", "rounding", 750),
    "decimal": ("number", "decimals", 800),
    "fraction": ("number", "fractions", 850),
    "percentage": ("number", "percentages", 850),
    "percent": ("number", "percentages", 850),
    "equivalent": ("number", "fractions", 800),
    "place value": ("number", "place-value", 750),
    "factor": ("number", "factors", 850),
    "multiple": ("number", "multiples", 800),
    "square number": ("number", "squares", 850),
    "prime": ("number", "primes", 900),
    "negative": ("number", "negative-numbers", 850),
    "order": ("number", "ordering", 750),
    "odd": ("number", "odd-even", 700),
    "even": ("number", "odd-even", 700),
    "calculate": ("calculation", "multi-step", 800),
    "add": ("calculation", "addition", 750),
    "subtract": ("calculation", "subtraction", 750),
    "multiply": ("calculation", "multiplication", 800),
    "divide": ("calculation", "division", 800),
    "remainder": ("calculation", "division", 850),
    "estimate": ("calculation", "estimation", 800),
    "total": ("calculation", "addition", 700),
    "double": ("calculation", "mental-math", 750),
    "half": ("calculation", "mental-math", 750),
    "angle": ("geometry", "angles", 800),
    "acute": ("geometry", "angles", 750),
    "obtuse": ("geometry", "angles", 800),
    "right angle": ("geometry", "angles", 700),
    "triangle": ("geometry", "shapes-2d", 750),
    "rectangle": ("geometry", "shapes-2d", 700),
    "square": ("geometry", "shapes-2d", 700),
    "hexagon": ("geometry", "shapes-2d", 750),
    "pentagon": ("geometry", "shapes-2d", 750),
    "quadrilateral": ("geometry", "shapes-2d", 800),
    "parallel": ("geometry", "shapes-2d", 800),
    "perpendicular": ("geometry", "shapes-2d", 850),
    "symmetry": ("geometry", "symmetry", 750),
    "reflect": ("geometry", "symmetry", 800),
    "rotate": ("geometry", "rotation", 850),
    "translate": ("geometry", "translation", 850),
    "coordinate": ("geometry", "coordinates", 800),
    "position": ("geometry", "coordinates", 750),
    "net": ("geometry", "shapes-3d", 850),
    "cube": ("geometry", "shapes-3d", 800),
    "face": ("geometry", "shapes-3d", 750),
    "edge": ("geometry", "shapes-3d", 800),
    "vertex": ("geometry", "shapes-3d", 800),
    "perimeter": ("measure", "perimeter", 850),
    "area": ("measure", "area", 900),
    "litre": ("measure", "capacity", 750),
    "millilitre": ("measure", "capacity", 750),
    "metre": ("measure", "length", 700),
    "centimetre": ("measure", "length", 700),
    "millimetre": ("measure", "length", 750),
    "kilometre": ("measure", "length", 800),
    "gram": ("measure", "mass", 750),
    "kilogram": ("measure", "mass", 750),
    "mass": ("measure", "mass", 750),
    "weigh": ("measure", "mass", 750),
    "time": ("measure", "time", 750),
    "hour": ("measure", "time", 700),
    "minute": ("measure", "time", 700),
    "second": ("measure", "time", 750),
    "clock": ("measure", "time", 750),
    "money": ("measure", "money", 750),
    "cost": ("measure", "money", 750),
    "price": ("measure", "money", 800),
    "$": ("measure", "money", 750),
    "graph": ("data", "graphs", 800),
    "chart": ("data", "bar-charts", 750),
    "bar chart": ("data", "bar-charts", 750),
    "pictogram": ("data", "pictograms", 750),
    "tally": ("data", "tally-charts", 700),
    "table": ("data", "tables", 750),
    "median": ("data", "averages", 850),
    "mean": ("data", "averages", 850),
    "mode": ("data", "averages", 800),
    "range": ("data", "averages", 800),
    "probability": ("data", "probability", 850),
    "likely": ("data", "probability", 800),
    "certain": ("data", "probability", 800),
    "impossible": ("data", "probability", 750),
    "spinner": ("data", "probability", 850),
    "venn": ("data", "venn-diagrams", 850),
    "carroll": ("data", "carroll-diagrams", 850),
}

def classify_question(text: str) -> tuple[str, str, int]:
    text_lower = text.lower()
    for keyword, (topic, subtopic, difficulty) in TOPIC_MAPPINGS.items():
        if keyword in text_lower:
            return topic, subtopic, difficulty
    if any(op in text for op in ['×', '÷', '+', '-', '=']):
        return "calculation", "multi-step", 800
    return "number", "general", 750

def extract_questions_from_pdf(pdf_path: str) -> list[dict]:
    filename = os.path.basename(pdf_path)
    file_id = filename.split('_')[0]
    doc = fitz.open(pdf_path)
    full_text = ""
    for page in doc:
        full_text += page.get_text() + "\n"
    
    question_pattern = r'\n(\d{1,2})\s+(?=[A-Z])'
    parts = re.split(question_pattern, full_text)
    
    questions = []
    for i in range(1, len(parts), 2):
        if i + 1 >= len(parts): break
        q_num = parts[i]
        q_text = parts[i + 1]
        
        marks_match = re.findall(r'\[(\d)\]', q_text)
        total_marks = sum(int(m) for m in marks_match) if marks_match else 1
        
        q_text = re.sub(r'\[Turn over\s*', '', q_text)
        q_text = re.sub(r'© UCLES \d{4}\s*', '', q_text)
        q_text = re.sub(r'\d{4}_\d{2}\s*', '', q_text)
        q_text = re.sub(r'\[\d\]', '', q_text)
        q_text = q_text[:600].strip()
        
        if len(q_text) < 20 or 'INSTRUCTION' in q_text.upper(): continue
        
        q_id = f"mat-{file_id}-{q_num.zfill(2)}"
        topic, subtopic, difficulty = classify_question(q_text)
        if total_marks >= 2: difficulty = min(difficulty + 100, 1000)
        
        questions.append({
            "id": q_id,
            "topic": topic,
            "subtopic": subtopic,
            "difficulty": difficulty,
            "text": q_text,
            "options": ["Option A", "Option B", "Option C"],
            "correctIndex": 0,
            "explanation": f"Source: {filename}",
            "source": filename,
            "marks": total_marks,
            "hasImage": any(p in q_text.lower() for p in ['diagram', 'picture', 'shown', 'shape below', 'grid below']),
            "needsReview": True,
            "timesAnswered": 0,
            "correctRate": 0.0
        })
    doc.close()
    return questions

def main():
    pdfs = [
        "materials/39064_qp_Gamatrain.com_0TMIQB.pdf",
        "materials/39008_qp_Gamatrain.com_5uwXvj.pdf",
        "materials/39007_qp_Gamatrain.com_bnElxg.pdf",
        "materials/39006_qp_Gamatrain.com_TO52KW.pdf",
        "materials/39005_qp_Gamatrain.com_mH6uXM.pdf",
        "materials/43285_qp_Gamatrain.com_ZOIM0P.pdf",
        "materials/43284_qp_Gamatrain.com_84H4nx.pdf"
    ]
    all_extracted = []
    for pdf in pdfs:
        if os.path.exists(pdf):
            print(f"Extracting {pdf}...")
            all_extracted.extend(extract_questions_from_pdf(pdf))
        else:
            print(f"Warning: {pdf} not found")
            
    output_path = "capy-checkpoint-next/src/data/extracted-raw.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_extracted, f, indent=2, ensure_ascii=False)
    print(f"Extracted {len(all_extracted)} questions to {output_path}")

if __name__ == "__main__":
    main()
