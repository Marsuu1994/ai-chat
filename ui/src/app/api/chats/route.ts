import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/chats - List all chats
export async function GET() {
  const chats = await prisma.chat.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      metadata: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(chats);
}

// POST /api/chats - Create new chat
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, metadata } = body;

  if (!title || typeof title !== "string") {
    return NextResponse.json(
      { error: "Title is required" },
      { status: 400 }
    );
  }

  const chat = await prisma.chat.create({
    data: {
      title,
      metadata: metadata ?? null,
    },
  });

  return NextResponse.json(chat, { status: 201 });
}
