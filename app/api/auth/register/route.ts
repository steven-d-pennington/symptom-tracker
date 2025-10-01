import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createUser } from "@/lib/auth";

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = RegisterSchema.parse(json);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 },
      );
    }

    await createUser(data);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((issue) => issue.message).join(", ") },
        { status: 400 },
      );
    }

    console.error("Registration error", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}