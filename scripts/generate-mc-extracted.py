#!/usr/bin/env python3
import json
import os
import subprocess
import time

def call_gemini(prompt: str) -> str:
    try:
        result = subprocess.run(['gemini', '-p', prompt], capture_output=True, text=True, timeout=120)
        return result.stdout.strip()
    except Exception as e:
        return f"Error: {e}"

def parse_gemini_response(response: str) -> list[dict]:
    results = []
    for line in response.split('\n'):
        line = line.strip()
        if line.startswith('{') and line.endswith('}'):
            try:
                results.append(json.loads(line))
            except:
                continue
    return results

def process_batch(questions: list[dict]) -> list[dict]:
    prompt = """Convert these math questions to multiple choice format.
Return a JSON object on a single line for each question with:
- id: copy exactly
- text: cleaned question (max 150 chars)
- options: array of 3 options (first is ALWAYS correct)
- correctIndex: 0
- explanation: brief solution (max 50 chars)
If unclear/image-dependent, return {"id": "xxx", "skip": true}

Questions:
"""
    for q in questions:
        prompt += f"\n{q['id']}: {q['text']}"
    prompt += "\n\nReturn ONLY JSON objects, one per line:"
    
    response = call_gemini(prompt)
    return parse_gemini_response(response)

def main():
    input_path = "capy-checkpoint-next/src/data/extracted-raw.json"
    output_path = "capy-checkpoint-next/src/data/extracted-mc.json"
    
    with open(input_path, 'r', encoding='utf-8') as f:
        questions = json.load(f)
    
    q_by_id = {q['id']: q for q in questions}
    processed = []
    batch_size = 10
    
    for i in range(0, len(questions), batch_size):
        batch = questions[i:i + batch_size]
        print(f"Processing batch {i//batch_size + 1}/{(len(questions)+batch_size-1)//batch_size}...")
        results = process_batch(batch)
        for r in results:
            if not r.get('skip') and r.get('id') in q_by_id:
                q = q_by_id[r['id']]
                q.update({
                    'text': r.get('text', q['text']),
                    'options': r.get('options', q['options']),
                    'correctIndex': 0,
                    'explanation': r.get('explanation', q['explanation']),
                    'needsReview': False
                })
                processed.append(q)
        time.sleep(1)
        if i > 0 and i % 50 == 0:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(processed, f, indent=2, ensure_ascii=False)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(processed, f, indent=2, ensure_ascii=False)
    print(f"Finished. Processed {len(processed)} questions.")

if __name__ == "__main__":
    main()
