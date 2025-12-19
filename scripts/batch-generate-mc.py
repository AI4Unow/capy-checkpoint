#!/usr/bin/env python3
"""
Batch process questions with Gemini to generate MC options.
Processes 10 questions per API call for efficiency.
"""

import json
import os
import subprocess
import re
import time

def call_gemini(prompt: str) -> str:
    """Call Gemini CLI."""
    try:
        result = subprocess.run(
            ['gemini', '-p', prompt],
            capture_output=True,
            text=True,
            timeout=90
        )
        return result.stdout.strip()
    except Exception as e:
        return f"Error: {e}"


def parse_gemini_response(response: str) -> list[dict]:
    """Parse multiple JSON objects from Gemini response."""
    results = []
    for line in response.split('\n'):
        line = line.strip()
        if line.startswith('{'):
            try:
                data = json.loads(line)
                results.append(data)
            except json.JSONDecodeError:
                continue
    return results


def process_batch(questions: list[dict]) -> list[dict]:
    """Process a batch of questions with Gemini."""
    prompt = """Convert these Cambridge Primary Stage 5 math questions to multiple choice format.

For each question, return a JSON object on a single line with:
- id: the question ID (copy exactly)
- text: cleaned question text (max 150 chars, remove ...... and formatting)
- options: array of 3 options where first is ALWAYS the correct answer
- correctIndex: 0 (correct is always first)
- explanation: brief solution (max 50 chars)

If a question is unclear, image-dependent, or cannot be converted, return {"id": "xxx", "skip": true}

Questions:
"""
    for q in questions:
        prompt += f"\n{q['id']}: {q['text'][:250]}"

    prompt += "\n\nReturn ONLY valid JSON objects, one per line. No markdown, no extra text:"

    response = call_gemini(prompt)
    return parse_gemini_response(response)


def main():
    """Process all questions in batches."""
    base_dir = os.path.dirname(os.path.dirname(__file__))
    input_path = os.path.join(base_dir, 'src', 'data', 'cambridge-2018-2026-questions.json')
    output_path = os.path.join(base_dir, 'src', 'data', 'cambridge-new-mc-questions.json')

    with open(input_path, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    print(f"Processing {len(questions)} questions in batches of 10...")

    processed = []
    skipped = 0
    batch_size = 10

    # Create ID to question mapping
    q_by_id = {q['id']: q for q in questions}

    for i in range(0, len(questions), batch_size):
        batch = questions[i:i + batch_size]
        batch_num = i // batch_size + 1
        total_batches = (len(questions) + batch_size - 1) // batch_size

        print(f"  Batch {batch_num}/{total_batches}...", end=" ", flush=True)

        results = process_batch(batch)

        for r in results:
            if r.get('skip'):
                skipped += 1
                continue

            q_id = r.get('id')
            if q_id and q_id in q_by_id:
                original = q_by_id[q_id]

                # Update with Gemini's answers
                original['text'] = r.get('text', original['text'])
                original['options'] = r.get('options', original['options'])
                original['correctIndex'] = r.get('correctIndex', 0)
                original['explanation'] = r.get('explanation', original['explanation'])
                original['needsReview'] = False

                processed.append(original)

        print(f"got {len(results)} results")

        # Save checkpoint every 100 questions
        if i > 0 and i % 100 == 0:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(processed, f, indent=2, ensure_ascii=False)
            print(f"    Checkpoint: {len(processed)} questions saved")

        # Small delay between batches
        time.sleep(1)

    # Final save
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(processed, f, indent=2, ensure_ascii=False)

    # Count by topic
    topic_counts = {}
    for q in processed:
        topic = q['topic']
        topic_counts[topic] = topic_counts.get(topic, 0) + 1

    print(f"\n=== Complete ===")
    print(f"Processed: {len(processed)}")
    print(f"Skipped: {skipped}")
    print("\nBy topic:")
    for topic, count in sorted(topic_counts.items()):
        print(f"  {topic}: {count}")
    print(f"\nSaved to: {output_path}")


if __name__ == "__main__":
    main()
