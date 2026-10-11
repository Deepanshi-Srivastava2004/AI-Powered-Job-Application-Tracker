
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This GET endpoint checks whether the database is reachable.
export async function GET() {
  try {
    // Ask MySQL to run a simple health-check query.
    await prisma.$queryRaw`SELECT 1`;

    // Return success if the query works.
    return NextResponse.json({
      success: true,
      message: "Database connection successful!",
    });
  } catch (error) {
    // Log the error in the terminal for debugging.
    console.error("Database connection failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed.",
      },
      { status: 500 }
    );
  }
}
