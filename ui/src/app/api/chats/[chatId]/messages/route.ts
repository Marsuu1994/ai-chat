import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { MessageRole } from "@/generated/prisma/client";

interface RouteParams {
  params: Promise<{ chatId: string }>;
}

// GET /api/chats/{chatId}/messages - Get messages for a chat
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { chatId } = await params;

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
  });

  if (!chat) {
    return NextResponse.json(
      { error: "Chat not found" },
      { status: 404 }
    );
  }

  const messages = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      role: true,
      content: true,
      createdAt: true,
    },
  });

  // Convert BigInt id to string for JSON serialization
  const serializedMessages = messages.map((msg) => ({
    ...msg,
    id: msg.id.toString(),
  }));

  return NextResponse.json(serializedMessages);
}

// POST /api/chats/{chatId}/messages - Add message to chat
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { chatId } = await params;
  const body = await request.json();
  const { role, content } = body;

  // Validate role
  const validRoles: MessageRole[] = ["user", "assistant", "system"];
  if (!role || !validRoles.includes(role)) {
    return NextResponse.json(
      { error: "Invalid role. Must be 'user', 'assistant', or 'system'" },
      { status: 400 }
    );
  }

  if (!content || typeof content !== "string") {
    return NextResponse.json(
      { error: "Content is required" },
      { status: 400 }
    );
  }

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
  });

  if (!chat) {
    return NextResponse.json(
      { error: "Chat not found" },
      { status: 404 }
    );
  }

  const message = await prisma.message.create({
    data: {
      chatId,
      role,
      content,
    },
  });

  // Update chat's updatedAt timestamp
  await prisma.chat.update({
    where: { id: chatId },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json(
    {
      ...message,
      id: message.id.toString(),
    },
    { status: 201 }
  );
}
