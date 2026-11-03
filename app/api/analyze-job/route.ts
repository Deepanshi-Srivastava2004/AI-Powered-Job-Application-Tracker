
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_ATTEMPTS = 3;

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

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

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function POST(request: Request) {
  try {
    // 1. Validate the incoming request.
    let body: { jobDescription?: unknown };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid request body.",
        },
        { status: 400 }
      );
    }

    const jobDescription = body.jobDescription;

    if (
      typeof jobDescription !== "string" ||
      !jobDescription.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a job description.",
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

    // 2. Check that the Gemini API key is configured.
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

    // 3. Ask Gemini to analyze the job description.
    const prompt = `
      Analyze the following job description and return ONLY valid JSON.

      Use this exact JSON structure:
      {
        "jobTitle": "string",
        "experienceLevel": "string",
        "summary": "string",
        "requiredSkills": ["string"],
        "keyResponsibilities": ["string"],
        "interviewQuestions": [
          {
            "question": "string",
            "type": "Technical or Behavioral"
          }
        ]
      }

      Instructions:
      - Identify the likely job title.
      - Estimate the experience level from the description.
      - Summarize the role clearly.
      - List important required technical and professional skills.
      - List the key responsibilities.
      - Generate 5 relevant interview questions.
      - Mark each interview question as Technical or Behavioral.
      - Do not include Markdown code fences.
      - Do not add text outside the JSON object.

      Job description:
      ${jobDescription}
    `;

    // 4. Call Gemini with a maximum of three attempts.
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

        // The request succeeded, so stop retrying.
        break;
      } catch (error: unknown) {
        const temporary = isTemporaryError(error);

        console.error(
          `Gemini attempt ${attempt}/${MAX_ATTEMPTS} failed:`,
          getErrorMessage(error)
        );

        // Retry only temporary errors.
        if (!temporary || attempt === MAX_ATTEMPTS) {
          throw error;
        }

        // Wait 1 second, then 2 seconds.
        const delay = 1000 * 2 ** (attempt - 1);

        console.log(
          `Retrying Gemini request in ${delay}ms...`
        );

        await sleep(delay);
      }
    }

    if (!response) {
      throw new Error("Gemini returned no response.");
    }

    // 5. Extract and parse Gemini's JSON response.
    const responseText = response.text;

    if (!responseText) {
      throw new Error("Gemini returned an empty response.");
    }

    const cleanedText = responseText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    const analysis = JSON.parse(cleanedText);

    // 6. Validate the important response fields.
    if (
      typeof analysis.jobTitle !== "string" ||
      typeof analysis.experienceLevel !== "string" ||
      typeof analysis.summary !== "string" ||
      !Array.isArray(analysis.requiredSkills) ||
      !Array.isArray(analysis.keyResponsibilities) ||
      !Array.isArray(analysis.interviewQuestions)
    ) {
      throw new Error("Gemini returned an unexpected JSON structure.");
    }

    // 7. Send the result to the frontend.
    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error: unknown) {
    console.error("Job analysis failed:", error);

    if (isTemporaryError(error)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The AI service is temporarily busy. Please wait a minute and try again.",
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
          "Unable to analyze the job description. Please try again.",
      },
      { status: 500 }
    );
  }
}
