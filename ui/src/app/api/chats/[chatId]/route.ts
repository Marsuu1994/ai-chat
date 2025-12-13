import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ chatId: string }>;
}

// GET /api/chats/{chatId} - Get single chat metadata
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { chatId } = await params;

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    select: {
      id: true,
      title: true,
      metadata: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!chat) {
    return NextResponse.json(
      { error: "Chat not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(chat);
}

// PATCH /api/chats/{chatId} - Update chat
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { chatId } = await params;
  const body = await request.json();
  const { title, metadata } = body;

  const existingChat = await prisma.chat.findUnique({
    where: { id: chatId },
  });

  if (!existingChat) {
    return NextResponse.json(
      { error: "Chat not found" },
      { status: 404 }
    );
  }

  const chat = await prisma.chat.update({
    where: { id: chatId },
    data: {
      ...(title !== undefined && { title }),
      ...(metadata !== undefined && { metadata }),
    },
  });

  return NextResponse.json(chat);
}

// DELETE /api/chats/{chatId} - Delete chat
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { chatId } = await params;

  const existingChat = await prisma.chat.findUnique({
    where: { id: chatId },
  });

  if (!existingChat) {
    return NextResponse.json(
      { error: "Chat not found" },
      { status: 404 }
    );
  }

  await prisma.chat.delete({
    where: { id: chatId },
  });

  return new NextResponse(null, { status: 204 });
}
