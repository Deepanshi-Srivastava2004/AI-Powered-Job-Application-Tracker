
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Allowed application statuses.
const allowedStatuses = [
  "APPLIED",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
];

// PATCH /api/applications/:id
// Updates the status of an existing application.
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    // Read the application ID from the URL.
    const { id } = await context.params;
    const applicationId = Number(id);

    // Validate the ID.
    if (!Number.isInteger(applicationId) || applicationId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid application ID." },
        { status: 400 },
      );
    }

    // Read and validate the requested status.
    const body = await request.json();

    if (
      typeof body.status !== "string" ||
      !allowedStatuses.includes(body.status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid application status.",
        },
        { status: 400 },
      );
    }

    // Check that the application exists before updating it.
    const existingApplication = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!existingApplication) {
      return NextResponse.json(
        { success: false, message: "Application not found." },
        { status: 404 },
      );
    }

    // Update only the status field.
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { status: body.status },
    });

    return NextResponse.json({
      success: true,
      message: "Application status updated successfully!",
      data: updatedApplication,
    });
  } catch (error) {
    console.error("Failed to update application:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not update application status.",
      },
      { status: 500 },
    );
  }
}


 
// PUT /api/applications/:id
// Updates the editable details of an existing application.
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    // Read the application ID from the URL.
    const { id } = await context.params;
    const applicationId = Number(id);

    // Validate the ID.
    if (!Number.isInteger(applicationId) || applicationId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid application ID." },
        { status: 400 },
      );
    }

    // Read the updated details sent by the frontend.
    const body = await request.json();

    // Company name and job title are required.
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
        { status: 400 },
      );
    }

    // Check whether the application exists.
    const existingApplication = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!existingApplication) {
      return NextResponse.json(
        { success: false, message: "Application not found." },
        { status: 404 },
      );
    }

    // Update the editable fields without changing the status or user.
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        company: body.company.trim(),
        jobTitle: body.jobTitle.trim(),

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

    return NextResponse.json({
      success: true,
      message: "Application updated successfully!",
      data: updatedApplication,
    });
  } catch (error) {
    console.error("Failed to update application:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not update the application.",
      },
      { status: 500 },
    );
  }
}


 
// DELETE /api/applications/:id
// Deletes an existing job application.
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    // Read the application ID from the URL.
    const { id } = await context.params;
    const applicationId = Number(id);

    // Validate the ID.
    if (!Number.isInteger(applicationId) || applicationId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid application ID." },
        { status: 400 },
      );
    }

    // Check whether the application exists.
    const existingApplication = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!existingApplication) {
      return NextResponse.json(
        { success: false, message: "Application not found." },
        { status: 404 },
      );
    }

    // Permanently delete the application from the database.
    await prisma.application.delete({
      where: { id: applicationId },
    });

    return NextResponse.json({
      success: true,
      message: "Application deleted successfully!",
    });
  } catch (error) {
    console.error("Failed to delete application:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not delete the application.",
      },
      { status: 500 },
    );
  }
}
