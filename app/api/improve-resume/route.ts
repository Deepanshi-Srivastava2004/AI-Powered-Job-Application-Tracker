import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Limit the number of attempts for temporary Gemini errors.
const MAX_ATTEMPTS = 3;

// Helper function to pause before retrying.
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Extract the HTTP status code from a Gemini error.
function getErrorStatus(error: unknown): number {
  if (typeof error !== "object" || error === null) {
    return 0;
  }

  if ("status" in error) {
    return Number(error.status);
  }

  if ("code" in error) {
    return Number(error.code);
  }

  return 0;
}

// Identify temporary errors that might succeed on a retry.
function isTemporaryError(error: unknown): boolean {
  const status = getErrorStatus(error);

  const message =
    error instanceof Error ? error.message : String(error);

  return (
    status === 429 ||
    status === 503 ||
    status >= 500 ||
    message.includes("UNAVAILABLE") ||
    message.includes("RESOURCE_EXHAUSTED")
  );
}

export async function POST(request: Request) {
  try {
    // 1. Read the data sent by the frontend.
    const body = await request.json();

    const { resumeText, jobDescription } = body;

    // 2. Validate the resume text.
    if (
      typeof resumeText !== "string" ||
      !resumeText.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter your resume text.",
        },
        { status: 400 }
      );
    }

    // 3. Validate the job description.
    if (
      typeof jobDescription !== "string" ||
      !jobDescription.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter the job description.",
        },
        { status: 400 }
      );
    }

    // 4. Prevent excessively large requests.
    if (resumeText.length > 15000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Resume text is too long. Please keep it under 15,000 characters.",
        },
        { status: 400 }
      );
    }

    if (jobDescription.length > 20000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Job description is too long. Please keep it under 20,000 characters.",
        },
        { status: 400 }
      );
    }

    // 5. Read the API key from the server environment.
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is not configured.");

      return NextResponse.json(
        {
          success: false,
          message: "AI service configuration is missing.",
        },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // 6. Ask Gemini to analyze the resume against the job.
    const prompt = `
      You are a professional resume reviewer.

      Analyze the resume in relation to the supplied job description.

      Return ONLY a valid JSON object using this structure:

      {
        "overallAssessment": "string",
        "strengths": ["string"],
        "missingSkills": ["string"],
        "improvementSuggestions": ["string"],
        "summarySuggestion": "string",
        "improvedBulletPoints": ["string"]
      }

      Instructions:

      - Identify strengths relevant to the job description.
      - Identify skills mentioned in the job description that are not
        evident in the resume.
      - Missing skills are suggestions to review, not skills the user
        should claim without actually possessing them.
      - Suggest specific, actionable resume improvements.
      - Write a tailored professional summary based only on the
        candidate's supplied experience and skills.
      - Suggest improved resume bullet points using only facts
        supported by the original resume.
      - Do not invent employers, degrees, skills, responsibilities,
        metrics, or achievements.
      - If there is insufficient information to make a suggestion,
        explain that in the relevant field.
      - Do not include Markdown code fences or text outside the JSON.

      RESUME:
      ${resumeText}

      JOB DESCRIPTION:
      ${jobDescription}
    `;

    // 7. Call Gemini, retrying temporary errors up to three times.
    let response:
      | Awaited<ReturnType<typeof ai.models.generateContent>>
      | undefined;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        // Stop retrying when Gemini succeeds.
        break;
      } catch (error: unknown) {
        console.error(
          `Resume analysis attempt ${attempt} failed:`,
          error
        );

        if (!isTemporaryError(error) || attempt === MAX_ATTEMPTS) {
          throw error;
        }

        // Wait 1 second, then 2 seconds before retrying.
        const delay = 1000 * 2 ** (attempt - 1);

        console.log(
          `Retrying resume analysis in ${delay}ms...`
        );

        await sleep(delay);
      }
    }

    if (!response) {
      throw new Error("Gemini returned no response.");
    }

    // 8. Extract the AI-generated response.
    const responseText = response.text;

    if (!responseText) {
      throw new Error("Gemini returned an empty response.");
    }

    // Remove Markdown fences if Gemini includes them.
    const cleanedText = responseText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    // Convert the JSON string into a JavaScript object.
    const analysis = JSON.parse(cleanedText);

    // 9. Check the expected response structure.
    if (
      typeof analysis.overallAssessment !== "string" ||
      !Array.isArray(analysis.strengths) ||
      !Array.isArray(analysis.missingSkills) ||
      !Array.isArray(analysis.improvementSuggestions) ||
      typeof analysis.summarySuggestion !== "string" ||
      !Array.isArray(analysis.improvedBulletPoints)
    ) {
      throw new Error("Gemini returned an unexpected response structure.");
    }

    // 10. Return the analysis to the frontend.
    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error: unknown) {
    console.error("Resume improvement analysis failed:", error);

    if (isTemporaryError(error)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The AI service is temporarily busy. Please try again shortly.",
        },
        { status: 503 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The AI returned an invalid response. Please try again.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to improve the resume right now. Please try again.",
      },
      { status: 500 }
    );
  }
}