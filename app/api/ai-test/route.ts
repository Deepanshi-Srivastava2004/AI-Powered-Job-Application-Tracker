
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

// Test Gemini from the server only.
export async function GET() {
  try {
    // Read the API key from the private environment variable.
    const apiKey = process.env.GEMINI_API_KEY;

    // Return an error if the key is missing.
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "Gemini API key is missing." },
        { status: 500 },
      );
    }

    // Create the Gemini client on the server.
    const ai = new GoogleGenAI({ apiKey });

    // Send a simple test prompt to Gemini.
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: "Reply with exactly: JobPilot Gemini connection successful!",
    });

    // Return Gemini's response to the browser.
    return NextResponse.json({
      success: true,
      message: response.text,
    });
  } catch (error: unknown) {
  // Print the actual Gemini error in the VS Code terminal.
  if (error instanceof Error) {
    console.error("Gemini error message:", error.message);
    console.error("Gemini error details:", error);
  } else {
    console.error("Unknown Gemini error:", error);
  }

  return NextResponse.json(
    {
      success: false,
      message: "Gemini request failed. Check the server logs.",
    },
    { status: 500 },
  );
}
}
