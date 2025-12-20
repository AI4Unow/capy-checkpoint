#!/usr/bin/env python3
import json
import os
import sys
import firebase_admin
from firebase_admin import credentials, firestore

def load_json(path):
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def main():
    base_dir = "capy-checkpoint-next/src/data"
    all_questions_path = os.path.join(base_dir, "all-questions.json")
    new_questions_path = os.path.join(base_dir, "extracted-mc.json")
    
    all_q = load_json(all_questions_path)
    new_q = load_json(new_questions_path)
    
    q_map = {q['id']: q for q in all_q}
    for q in new_q:
        q_map[q['id']] = q
        
    merged = list(q_map.values())
    with open(all_questions_path, "w", encoding="utf-8") as f:
        json.dump(merged, f, indent=2, ensure_ascii=False)
    print(f"Merged. Total questions: {len(merged)}")
    
    # Initialize Firebase
    service_account = "firebase_service_account.json"
    if not os.path.exists(service_account):
        print("Service account not found.")
        return

    cred = credentials.Certificate(service_account)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    
    print("Uploading to Firestore...")
    batch = db.batch()
    count = 0
    for q in new_q:
        doc_ref = db.collection("questions").document(q["id"])
        batch.set(doc_ref, q, merge=True)
        count += 1
        if count % 400 == 0:
            batch.commit()
            batch = db.batch()
    
    batch.commit()
    print(f"Uploaded {count} new questions.")

if __name__ == "__main__":
    main()
