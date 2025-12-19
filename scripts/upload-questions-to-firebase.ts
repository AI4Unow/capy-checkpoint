/**
 * Upload questions to Firebase Firestore
 * Run with: npx tsx scripts/upload-questions-to-firebase.ts
 */

import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

// Service account path
const serviceAccountPath = path.join(__dirname, "../../firebase_service_account.json");

// Initialize Firebase Admin
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

interface Question {
  id: string;
  topic: string;
  subtopic: string;
  difficulty: number;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  source?: string;
  marks?: number;
  hasImage?: boolean;
  timesAnswered?: number;
  correctRate?: number;
}

async function loadJsonFile(filePath: string): Promise<Question[]> {
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

async function uploadQuestions(questions: Question[], collectionName = "questions"): Promise<number> {
  let batch = db.batch();
  let batchCount = 0;
  let totalUploaded = 0;

  for (const question of questions) {
    const docRef = db.collection(collectionName).doc(question.id);
    batch.set(docRef, question, { merge: true });
    batchCount++;
    totalUploaded++;

    // Firestore batch limit is 500
    if (batchCount >= 400) {
      await batch.commit();
      console.log(`Committed batch of ${batchCount} questions...`);
      batch = db.batch(); // Create new batch
      batchCount = 0;
    }
  }

  // Commit remaining
  if (batchCount > 0) {
    await batch.commit();
    console.log(`Committed final batch of ${batchCount} questions...`);
  }

  return totalUploaded;
}

async function main() {
  const basePath = path.dirname(__dirname);

  // Question file paths
  const questionFiles = [
    "src/data/questions.json",
    "src/data/cambridge-2014-questions.json",
    "src/data/cambridge-new-mc-questions.json",  // 2018-2026 papers
    "src/data/cambridge-2022-p1-questions.json", // 2022 Paper 1 (OCR)
    "src/data/cambridge-2018-2022-extra-questions.json", // Extra papers batch
  ];

  // Load all questions
  const questionMap = new Map<string, Question>();

  for (const file of questionFiles) {
    const filePath = path.join(basePath, file);
    if (fs.existsSync(filePath)) {
      const questions = await loadJsonFile(filePath);
      console.log(`Loaded ${questions.length} questions from ${file}`);
      for (const q of questions) {
        questionMap.set(q.id, q);
      }
    }
  }

  const allQuestions = Array.from(questionMap.values());
  console.log(`\nTotal unique questions: ${allQuestions.length}`);

  // Count by topic
  const topicCounts: Record<string, number> = {};
  for (const q of allQuestions) {
    topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
  }

  console.log("\nBy topic:");
  for (const [topic, count] of Object.entries(topicCounts).sort()) {
    console.log(`  ${topic}: ${count}`);
  }

  // Upload questions
  console.log("\nUploading questions to Firestore...");
  const uploaded = await uploadQuestions(allQuestions);
  console.log(`\n✅ Successfully uploaded ${uploaded} questions to Firestore!`);

  // Save merged questions locally
  const mergedPath = path.join(basePath, "src/data/all-questions.json");
  fs.writeFileSync(mergedPath, JSON.stringify(allQuestions, null, 2));
  console.log(`📁 Saved merged questions to: ${mergedPath}`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
