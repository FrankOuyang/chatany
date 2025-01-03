import { db } from "@/lib/db";
import { messages as messagesSchema } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    auth().protect();
    
    const { chatId } = params;
    const messages = await db
      .select()
      .from(messagesSchema)
      .where(eq(messagesSchema.chatId, parseInt(chatId)))
      .orderBy(messagesSchema.createdAt);

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
