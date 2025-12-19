import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import allQuestions from "@/data/all-questions.json";

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  // Use service account from environment variable or file
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : null;

  if (serviceAccount) {
    initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    // Fallback to default credentials (for local development)
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
}

/**
 * Upload all local questions to Firebase Firestore
 * POST /api/admin/upload-questions
 * Requires admin authentication (check API key)
 */
export async function POST(request: NextRequest) {
  // Simple API key auth for admin operations
  const authHeader = request.headers.get("authorization");
  const adminKey = process.env.ADMIN_API_KEY;

  if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getFirestore();
    const questionsCollection = db.collection("questions");

    // Get existing question IDs to avoid duplicates
    const existingSnapshot = await questionsCollection.get();
    const existingIds = new Set(existingSnapshot.docs.map((doc) => doc.id));

    let uploaded = 0;
    let skipped = 0;

    // Batch write for efficiency (500 max per batch)
    const batches: FirebaseFirestore.WriteBatch[] = [];
    let currentBatch = db.batch();
    let batchCount = 0;

    for (const question of allQuestions) {
      if (existingIds.has(question.id)) {
        skipped++;
        continue;
      }

      const docRef = questionsCollection.doc(question.id);
      currentBatch.set(docRef, {
        ...question,
        createdAt: new Date(),
        timesAnswered: 0,
      });

      batchCount++;
      uploaded++;

      // Firebase limit: 500 operations per batch
      if (batchCount >= 499) {
        batches.push(currentBatch);
        currentBatch = db.batch();
        batchCount = 0;
      }
    }

    // Push remaining batch
    if (batchCount > 0) {
      batches.push(currentBatch);
    }

    // Commit all batches
    for (const batch of batches) {
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      uploaded,
      skipped,
      total: allQuestions.length,
      message: `Uploaded ${uploaded} questions, skipped ${skipped} duplicates`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload questions", details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * Get upload status / question count
 * GET /api/admin/upload-questions
 */
export async function GET(request: NextRequest) {
  try {
    const db = getFirestore();
    const snapshot = await db.collection("questions").count().get();
    const count = snapshot.data().count;

    return NextResponse.json({
      firebaseCount: count,
      localCount: allQuestions.length,
      synced: count >= allQuestions.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get status", details: String(error) },
      { status: 500 }
    );
  }
}
