#!/usr/bin/env python3
"""
Enhanced parser that generates proper multiple-choice options
by analyzing question text and computing answers.
"""

import json
import os
import re
import random
from typing import Optional

def extract_number_from_text(text: str) -> Optional[float]:
    """Try to find the expected answer in the question text."""
    # Common answer patterns
    patterns = [
        r'=\s*([\d,]+\.?\d*)',  # After equals
        r'is\s+([\d,]+\.?\d*)',  # "is X"
        r'([\d,]+\.?\d*)\s+seats',  # "X seats"
        r'([\d,]+\.?\d*)\s+cm',  # "X cm"
        r'([\d,]+\.?\d*)\s+minutes',  # "X minutes"
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            try:
                return float(match.group(1).replace(',', ''))
            except ValueError:
                continue
    return None


def solve_arithmetic(text: str) -> Optional[float]:
    """Try to solve simple arithmetic in the question."""
    # Pattern: X + ? = Y or ? + X = Y
    add_pattern = r'(\d+\.?\d*)\s*\+\s*(?:\?|___)\s*=\s*(\d+\.?\d*)'
    match = re.search(add_pattern, text)
    if match:
        return float(match.group(2)) - float(match.group(1))

    # Pattern: X - ? = Y
    sub_pattern = r'(\d+\.?\d*)\s*-\s*(?:\?|___)\s*=\s*(\d+\.?\d*)'
    match = re.search(sub_pattern, text)
    if match:
        return float(match.group(1)) - float(match.group(2))

    # Pattern: X × Y (multiplication)
    mult_pattern = r'(\d+)\s*[×x]\s*(\d+)'
    match = re.search(mult_pattern, text)
    if match:
        return float(match.group(1)) * float(match.group(2))

    # Pattern: X ÷ Y (division)
    div_pattern = r'(\d+)\s*÷\s*(\d+)'
    match = re.search(div_pattern, text)
    if match:
        divisor = float(match.group(2))
        if divisor != 0:
            return float(match.group(1)) / divisor

    # Pattern: double X
    double_pattern = r'[Dd]ouble\s+(\d+\.?\d*)'
    match = re.search(double_pattern, text)
    if match:
        return float(match.group(1)) * 2

    # Pattern: half of X or X ÷ 2
    half_pattern = r'[Hh]alf\s+(?:of\s+)?(\d+\.?\d*)'
    match = re.search(half_pattern, text)
    if match:
        return float(match.group(1)) / 2

    # Word problems with rows/seats
    seats_pattern = r'(\d+)\s+rows?\s+(?:with\s+)?(\d+)\s+seats?'
    match = re.search(seats_pattern, text)
    if match:
        return float(match.group(1)) * float(match.group(2))

    return None


def generate_wrong_answers(correct: float, question_type: str) -> list[str]:
    """Generate plausible wrong answers."""
    wrong = []

    if isinstance(correct, float) and correct == int(correct):
        correct = int(correct)

    # Common mistake patterns
    if question_type == 'multiplication':
        wrong.append(str(int(correct) + 10))
        wrong.append(str(int(correct) - 10))
    elif question_type == 'addition':
        wrong.append(str(int(correct) + 1))
        wrong.append(str(int(correct) - 1))
    elif question_type == 'division':
        wrong.append(str(int(correct) + 1))
        wrong.append(str(int(correct) * 2))
    else:
        # Generic wrong answers
        if correct > 10:
            wrong.append(str(int(correct) + random.choice([5, 10, -5, -10])))
            wrong.append(str(int(correct) + random.choice([1, 2, -1, -2])))
        else:
            wrong.append(str(round(correct * 1.5, 1)))
            wrong.append(str(round(correct * 0.5, 1)))

    # Ensure we have 2 unique wrong answers
    wrong = list(set(wrong))
    while len(wrong) < 2:
        wrong.append(str(int(correct) + random.randint(-20, 20)))
        wrong = list(set(wrong))

    return wrong[:2]


def detect_question_type(text: str) -> str:
    """Detect the type of math question."""
    text_lower = text.lower()

    if '×' in text or 'multiply' in text_lower or 'times' in text_lower:
        return 'multiplication'
    elif '÷' in text or 'divide' in text_lower:
        return 'division'
    elif '+' in text or 'add' in text_lower or 'sum' in text_lower:
        return 'addition'
    elif '-' in text or 'subtract' in text_lower:
        return 'subtraction'
    elif 'double' in text_lower:
        return 'multiplication'
    elif 'half' in text_lower:
        return 'division'
    elif 'perimeter' in text_lower or 'area' in text_lower:
        return 'geometry'
    elif 'sequence' in text_lower or 'pattern' in text_lower:
        return 'sequence'
    else:
        return 'general'


def clean_question_text(text: str) -> str:
    """Clean up question text."""
    # Remove answer placeholders
    text = re.sub(r'\.{3,}', '___', text)
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()

    # Limit length
    if len(text) > 200:
        # Find a good break point
        sentences = text.split('. ')
        if len(sentences) > 1:
            text = sentences[0] + '.'
            if len(text) < 50 and len(sentences) > 1:
                text = sentences[0] + '. ' + sentences[1] + '.'

    return text[:200]


def process_question(q: dict) -> Optional[dict]:
    """Process a single question to add proper MC options."""
    text = q['text']
    q_type = detect_question_type(text)

    # Try to solve the question
    answer = solve_arithmetic(text)

    if answer is not None:
        # We can compute the answer
        wrong_answers = generate_wrong_answers(answer, q_type)

        # Format correct answer
        if answer == int(answer):
            correct_str = str(int(answer))
        else:
            correct_str = str(round(answer, 2))

        # Shuffle options
        options = [correct_str] + wrong_answers
        random.shuffle(options)
        correct_index = options.index(correct_str)

        q['options'] = options
        q['correctIndex'] = correct_index
        q['explanation'] = f"The answer is {correct_str}."
        q['needsReview'] = False
        q['text'] = clean_question_text(text)

        return q

    # Can't solve automatically - skip
    return None


def main():
    """Process all questions."""
    base_dir = os.path.dirname(os.path.dirname(__file__))
    input_path = os.path.join(base_dir, 'src', 'data', 'cambridge-2018-2026-questions.json')
    output_path = os.path.join(base_dir, 'src', 'data', 'cambridge-new-questions.json')

    with open(input_path, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    print(f"Processing {len(questions)} questions...")

    processed = []
    skipped = 0

    for q in questions:
        result = process_question(q)
        if result:
            processed.append(result)
        else:
            skipped += 1

    print(f"\nProcessed: {len(processed)}")
    print(f"Skipped (needs manual review): {skipped}")

    # Count by topic
    topic_counts = {}
    for q in processed:
        topic = q['topic']
        topic_counts[topic] = topic_counts.get(topic, 0) + 1

    print("\nBy topic:")
    for topic, count in sorted(topic_counts.items()):
        print(f"  {topic}: {count}")

    # Save
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(processed, f, indent=2, ensure_ascii=False)

    print(f"\nSaved to: {output_path}")


if __name__ == "__main__":
    random.seed(42)  # Reproducible results
    main()
