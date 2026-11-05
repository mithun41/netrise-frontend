import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    framework: "Next.js 16 (App Router)",
    stateManagement: "Zustand",
    styling: "Tailwind CSS v4",
    language: "JavaScript",
    timestamp: new Date().toISOString(),
  });
}

