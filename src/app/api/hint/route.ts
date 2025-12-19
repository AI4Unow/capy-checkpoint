import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview";

interface HintRequest {
  question: string;
  correctAnswer: string;
  studentAnswer: string;
  explanation?: string;
}

/**
 * Generate AI hint for wrong answer using Gemini
 */
export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Gemini API not configured" },
      { status: 500 }
    );
  }

  try {
    const body: HintRequest = await request.json();
    const { question, correctAnswer, studentAnswer, explanation } = body;

    const prompt = `You are a friendly math tutor for a 10-year-old student preparing for Cambridge Primary Checkpoint Math exam.

The student just answered a question incorrectly. Give them a SHORT, encouraging hint (max 2 sentences) to help them understand why their answer was wrong and guide them toward the correct thinking.

Question: ${question}
Student's answer: ${studentAnswer}
Correct answer: ${correctAnswer}
${explanation ? `Teacher's explanation: ${explanation}` : ""}

Rules:
- Be warm and encouraging (use phrases like "Almost!", "Good try!", "Think about...")
- Keep it SHORT - max 2 sentences
- Don't give the answer directly, just guide their thinking
- Use simple language a 10-year-old can understand
- Focus on the key concept they missed`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 100,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Gemini API error:", error);
      return NextResponse.json(
        { error: "Failed to generate hint" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const hint =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Keep trying! Review the question carefully.";

    return NextResponse.json({ hint });
  } catch (error) {
    console.error("Hint generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate hint" },
      { status: 500 }
    );
  }
}
