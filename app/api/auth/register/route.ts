// app/api/auth/register/route.ts

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Handles POST requests for user registration.
export async function POST(request: Request) {
  try {
    // Read the data sent from the Register form.
    const body = await request.json();

    const { name, email, password } = body;

    // Basic validation.
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    // Password should have a minimum length.
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters long.",
        },
        { status: 400 }
      );
    }

    // Convert email to lowercase and remove unnecessary spaces.
    const normalizedEmail = email.trim().toLowerCase();

    // Check whether a user with this email already exists.
    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "A user with this email already exists.",
        },
        { status: 409 }
      );
    }

    // Hash the password before saving it to the database.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user in MySQL.
    const user = await prisma.user.create({
      data: {
        name: name?.trim() || null,
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    // Never return the password/hash to the frontend.
    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while registering the user.",
      },
      { status: 500 }
    );
  }
}