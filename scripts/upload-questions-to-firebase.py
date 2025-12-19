#!/usr/bin/env python3
"""
Upload questions to Firebase Firestore using Admin SDK.
Merges existing questions.json with Cambridge 2014 questions.
"""

import json
import os
import sys

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
except ImportError:
    print("Installing firebase-admin...")
    os.system("pip3 install firebase-admin")
    import firebase_admin
    from firebase_admin import credentials, firestore


def load_json_file(path: str) -> list:
    """Load questions from JSON file."""
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def initialize_firebase():
    """Initialize Firebase Admin SDK."""
    # Path to service account key
    service_account_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        "firebase_service_account.json"
    )

    if not os.path.exists(service_account_path):
        print(f"Error: Service account file not found at {service_account_path}")
        sys.exit(1)

    cred = credentials.Certificate(service_account_path)
    firebase_admin.initialize_app(cred)

    return firestore.client()


def upload_questions(db, questions: list, collection_name: str = "questions"):
    """Upload questions to Firestore."""
    batch = db.batch()
    batch_count = 0
    total_uploaded = 0

    for question in questions:
        doc_ref = db.collection(collection_name).document(question["id"])
        batch.set(doc_ref, question, merge=True)
        batch_count += 1
        total_uploaded += 1

        # Firestore batch limit is 500
        if batch_count >= 400:
            batch.commit()
            print(f"Committed batch of {batch_count} questions...")
            batch = db.batch()
            batch_count = 0

    # Commit remaining
    if batch_count > 0:
        batch.commit()
        print(f"Committed final batch of {batch_count} questions...")

    return total_uploaded


def main():
    """Main upload function."""
    # Paths
    base_path = os.path.dirname(os.path.dirname(__file__))
    existing_questions_path = os.path.join(base_path, "src", "data", "questions.json")
    cambridge_questions_path = os.path.join(base_path, "src", "data", "cambridge-2014-questions.json")

    # Load questions
    existing_questions = []
    cambridge_questions = []

    if os.path.exists(existing_questions_path):
        existing_questions = load_json_file(existing_questions_path)
        print(f"Loaded {len(existing_questions)} existing questions")

    if os.path.exists(cambridge_questions_path):
        cambridge_questions = load_json_file(cambridge_questions_path)
        print(f"Loaded {len(cambridge_questions)} Cambridge 2014 questions")

    # Merge (avoid duplicates by ID)
    question_map = {}
    for q in existing_questions:
        question_map[q["id"]] = q
    for q in cambridge_questions:
        question_map[q["id"]] = q

    all_questions = list(question_map.values())
    print(f"\nTotal unique questions: {len(all_questions)}")

    # Count by topic
    topic_counts = {}
    for q in all_questions:
        topic = q["topic"]
        topic_counts[topic] = topic_counts.get(topic, 0) + 1

    print("\nBy topic:")
    for topic, count in sorted(topic_counts.items()):
        print(f"  {topic}: {count}")

    # Initialize Firebase
    print("\nInitializing Firebase...")
    db = initialize_firebase()

    # Upload questions
    print("\nUploading questions to Firestore...")
    uploaded = upload_questions(db, all_questions)
    print(f"\n✅ Successfully uploaded {uploaded} questions to Firestore!")

    # Also save merged questions locally
    merged_path = os.path.join(base_path, "src", "data", "all-questions.json")
    with open(merged_path, "w", encoding="utf-8") as f:
        json.dump(all_questions, f, indent=2, ensure_ascii=False)
    print(f"📁 Saved merged questions to: {merged_path}")


if __name__ == "__main__":
    main()
