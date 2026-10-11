
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/applications
// Fetch all job applications from the database.
export async function GET() {
  try {
    const applications = await prisma.application.findMany({
      orderBy: {
        createdAt: "desc", // Show newest applications first.
      },
    });

    return NextResponse.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error("Failed to fetch applications:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not fetch applications.",
      },
      { status: 500 }
    );
  }
}

// POST /api/applications
// Save a new job application in the database.
export async function POST(request: Request) {
  try {
    // Read the JSON data sent by the frontend.
    const body = await request.json();

    // Validate the required fields.
    if (
      typeof body.company !== "string" ||
      !body.company.trim() ||
      typeof body.jobTitle !== "string" ||
      !body.jobTitle.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Company and job title are required.",
        },
        { status: 400 }
      );
    }

    // TEMPORARY: Find our local development test user.
    // We'll replace this with the authenticated user later.
    const user = await prisma.user.findUnique({
      where: {
        email: "test@jobpilot.local",
      },
    });

    // Stop if the test user doesn't exist.
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Test user not found. Run the test-user script first.",
        },
        { status: 500 }
      );
    }

    // Create the job application and associate it with the test user.
    const application = await prisma.application.create({
      data: {
        company: body.company.trim(),
        jobTitle: body.jobTitle.trim(),
        userId: user.id,

        // Optional fields.
        jobDescription:
          typeof body.jobDescription === "string"
            ? body.jobDescription
            : null,

        jobUrl:
          typeof body.jobUrl === "string" && body.jobUrl.trim()
            ? body.jobUrl.trim()
            : null,

        notes:
          typeof body.notes === "string"
            ? body.notes
            : null,
      },
    });

    // Return the newly created application.
    return NextResponse.json(
      {
        success: true,
        message: "Application added successfully!",
        data: application,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create application:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not create the application.",
      },
      { status: 500 }
    );
  }
}



// GET	Fetch all job applications
// POST	Create a new job application
// Validation	Reject missing company names or job titles
// User association	Attach each new application to our temporary test user