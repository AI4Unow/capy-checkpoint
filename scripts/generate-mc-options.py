#!/usr/bin/env python3
"""
Generate multiple-choice options for extracted Cambridge questions using Gemini.
"""

import json
import os
import subprocess
import time
import re

def call_gemini(prompt: str) -> str:
    """Call Gemini CLI with a prompt."""
    try:
        result = subprocess.run(
            ['gemini', '-p', prompt],
            capture_output=True,
            text=True,
            timeout=30
        )
        return result.stdout.strip()
    except Exception as e:
        return f"Error: {e}"


def generate_options_for_question(question: dict) -> dict:
    """Generate multiple-choice options for a single question."""
    prompt = f"""You are a math teacher. Convert this Cambridge Primary Stage 5 math question into multiple choice format.

Question: {question['text']}
Topic: {question['topic']} - {question['subtopic']}

Return ONLY a JSON object (no markdown, no explanation) with this exact format:
{{"text": "cleaned question text", "options": ["correct answer", "plausible wrong 1", "plausible wrong 2"], "correctIndex": 0, "explanation": "brief solution"}}

Rules:
- The correct answer MUST be at index 0
- Options must be SHORT (max 15 chars each)
- Make wrong answers plausible (common mistakes)
- Clean up the question text (remove ......, formatting artifacts)
- If the question is unclear or image-dependent, return {{"skip": true}}"""

    response = call_gemini(prompt)

    try:
        # Try to parse JSON from response
        json_match = re.search(r'\{[^{}]+\}', response, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group())
            if data.get('skip'):
                return None
            return data
    except json.JSONDecodeError:
        pass

    return None


def process_questions(input_path: str, output_path: str, batch_size: int = 50):
    """Process questions in batches."""
    with open(input_path, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    print(f"Processing {len(questions)} questions...")

    processed = []
    skipped = 0

    for i, q in enumerate(questions):
        if i > 0 and i % 10 == 0:
            print(f"  Processed {i}/{len(questions)}... (skipped {skipped})")

        # Skip if already has real options
        if q['options'][0] != 'Option A':
            processed.append(q)
            continue

        result = generate_options_for_question(q)

        if result:
            q['text'] = result.get('text', q['text'])
            q['options'] = result['options']
            q['correctIndex'] = result.get('correctIndex', 0)
            q['explanation'] = result.get('explanation', q['explanation'])
            q['needsReview'] = False
            processed.append(q)
        else:
            skipped += 1

        # Rate limit
        time.sleep(0.5)

        # Save checkpoint every 50 questions
        if i > 0 and i % batch_size == 0:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(processed, f, indent=2, ensure_ascii=False)
            print(f"  Checkpoint saved ({len(processed)} questions)")

    # Final save
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(processed, f, indent=2, ensure_ascii=False)

    print(f"\n=== Complete ===")
    print(f"Total processed: {len(processed)}")
    print(f"Skipped: {skipped}")
    print(f"Saved to: {output_path}")

    return processed


if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(__file__))
    input_path = os.path.join(base_dir, 'src', 'data', 'cambridge-2018-2026-questions.json')
    output_path = os.path.join(base_dir, 'src', 'data', 'cambridge-2018-2026-questions-mc.json')

    process_questions(input_path, output_path)
