#!/usr/bin/env python3
"""
Parse Cambridge Primary Stage 5 Math PDFs (2018-2026) into structured questions.
Extracts questions and converts to multiple-choice format for Capy-Checkpoint game.
"""

import json
import os
import re
import fitz  # PyMuPDF
from typing import Optional

# Cambridge Stage 5 topic mapping
TOPIC_MAPPINGS = {
    # Number strand
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

    # Calculation strand
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

    # Geometry strand
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

    # Measure strand
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

    # Data strand
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
    """Classify question into topic, subtopic, and difficulty."""
    text_lower = text.lower()

    for keyword, (topic, subtopic, difficulty) in TOPIC_MAPPINGS.items():
        if keyword in text_lower:
            return topic, subtopic, difficulty

    # Default to calculation if contains operators
    if any(op in text for op in ['×', '÷', '+', '-', '=']):
        return "calculation", "multi-step", 800

    return "number", "general", 750


def extract_questions_from_pdf(pdf_path: str, year: int, paper: int) -> list[dict]:
    """Extract questions from a Cambridge Stage 5 PDF."""
    doc = fitz.open(pdf_path)
    questions = []

    full_text = ""
    for page in doc:
        full_text += page.get_text() + "\n"

    # Split by question numbers (1, 2, 3, etc.)
    # Pattern: newline followed by digit(s), then space or newline
    question_pattern = r'\n(\d{1,2})\s+(?=[A-Z])'
    parts = re.split(question_pattern, full_text)

    question_id_base = f"cam{str(year)[2:]}-p{paper}"

    for i in range(1, len(parts), 2):
        if i + 1 >= len(parts):
            break

        q_num = parts[i]
        q_text = parts[i + 1]

        # Extract marks from [1], [2], etc.
        marks_match = re.findall(r'\[(\d)\]', q_text)
        total_marks = sum(int(m) for m in marks_match) if marks_match else 1

        # Clean up question text
        q_text = re.sub(r'\[Turn over\s*', '', q_text)
        q_text = re.sub(r'© UCLES \d{4}\s*', '', q_text)
        q_text = re.sub(r'\d{4}_\d{2}\s*', '', q_text)
        q_text = re.sub(r'\[\d\]', '', q_text)  # Remove mark indicators

        # Limit to first ~500 chars to get main question
        q_text = q_text[:600].strip()

        # Skip if too short or looks like instructions
        if len(q_text) < 20 or 'INSTRUCTION' in q_text.upper():
            continue

        # Check if has sub-parts (a), (b), etc.
        sub_parts = re.findall(r'\(([a-d])\)', q_text)

        if sub_parts and len(sub_parts) > 1:
            # Split into sub-questions
            for sub in sub_parts[:3]:  # Limit to first 3 sub-parts
                sub_pattern = rf'\({sub}\)(.*?)(?=\([a-d]\)|$)'
                sub_match = re.search(sub_pattern, q_text, re.DOTALL)
                if sub_match:
                    sub_text = sub_match.group(1).strip()[:400]
                    if len(sub_text) > 20:
                        q_id = f"{question_id_base}-{q_num.zfill(2)}{sub}"
                        question = create_question(q_id, sub_text, year, paper, 1)
                        if question:
                            questions.append(question)
        else:
            # Single question
            q_id = f"{question_id_base}-{q_num.zfill(2)}"
            question = create_question(q_id, q_text, year, paper, total_marks)
            if question:
                questions.append(question)

    doc.close()
    return questions


def create_question(q_id: str, text: str, year: int, paper: int, marks: int) -> Optional[dict]:
    """Create a structured question entry with generated options."""
    # Clean text
    text = ' '.join(text.split())  # Normalize whitespace
    text = text[:300]  # Limit length

    # Skip image-only or unclear questions
    skip_patterns = [
        'diagram', 'picture', 'shown', 'shape below', 'grid below',
        'not drawn', 'show your working', 'write your answer'
    ]
    text_lower = text.lower()
    has_image = any(p in text_lower for p in skip_patterns)

    if len(text) < 30:
        return None

    # Classify
    topic, subtopic, difficulty = classify_question(text)

    # Adjust difficulty based on marks
    if marks >= 2:
        difficulty = min(difficulty + 100, 1000)

    # Generate placeholder options (will be filled manually or by AI later)
    options = ["Option A", "Option B", "Option C"]
    correct_index = 0  # Placeholder

    return {
        "id": q_id,
        "topic": topic,
        "subtopic": subtopic,
        "difficulty": difficulty,
        "text": text,
        "options": options,
        "correctIndex": correct_index,
        "explanation": f"See Cambridge {year} Paper {paper} for solution",
        "source": f"Cambridge {year} Paper {paper}",
        "marks": marks,
        "hasImage": has_image,
        "needsReview": True,  # Flag for manual review
        "timesAnswered": 0,
        "correctRate": 0.0
    }


def get_papers_to_parse(materials_dir: str) -> list[dict]:
    """Get list of unique papers to parse."""
    papers = {}

    for pdf_file in sorted(os.listdir(materials_dir)):
        if not pdf_file.endswith('.pdf'):
            continue
        if '2014' in pdf_file:  # Skip 2014, already parsed
            continue

        path = os.path.join(materials_dir, pdf_file)
        try:
            doc = fitz.open(path)
            text = doc[0].get_text()[:800]

            # Skip junk files
            if len(text) < 100:
                continue

            # Extract year
            year_match = re.search(r'(201[8-9]|202[0-6])', text)
            year = int(year_match.group(1)) if year_match else None

            # Extract paper number
            paper_match = re.search(r'[Pp]aper\s*([12])', text)
            paper = int(paper_match.group(1)) if paper_match else None

            if year and paper:
                key = f"{year}_P{paper}"
                if key not in papers:
                    papers[key] = {
                        'file': pdf_file,
                        'path': path,
                        'year': year,
                        'paper': paper
                    }

            doc.close()
        except Exception as e:
            print(f"Error reading {pdf_file}: {e}")

    return list(papers.values())


def main():
    """Main parsing function."""
    materials_dir = '/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/materials'
    output_dir = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        'src', 'data'
    )

    papers = get_papers_to_parse(materials_dir)
    print(f"Found {len(papers)} unique papers to parse (excluding 2014)")

    all_questions = []

    for paper_info in sorted(papers, key=lambda x: (x['year'], x['paper'])):
        print(f"\nParsing {paper_info['year']} Paper {paper_info['paper']}...")
        questions = extract_questions_from_pdf(
            paper_info['path'],
            paper_info['year'],
            paper_info['paper']
        )
        print(f"  Extracted {len(questions)} questions")
        all_questions.extend(questions)

    # Count by topic
    topic_counts = {}
    for q in all_questions:
        topic = q["topic"]
        topic_counts[topic] = topic_counts.get(topic, 0) + 1

    print(f"\n=== Summary ===")
    print(f"Total questions extracted: {len(all_questions)}")
    print("\nBy topic:")
    for topic, count in sorted(topic_counts.items()):
        print(f"  {topic}: {count}")

    # Save to JSON
    output_path = os.path.join(output_dir, 'cambridge-2018-2026-questions.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(all_questions, f, indent=2, ensure_ascii=False)

    print(f"\nSaved to: {output_path}")

    return all_questions


if __name__ == "__main__":
    main()
