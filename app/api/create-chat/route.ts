import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { loadFileIntoPgVector } from "@/lib/pgvector";
import { loadFileIntoPinecone } from "@/lib/pinecone";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request, res: Response) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { filepath, filename } = body;
    console.log("Creating chat with", filepath, filename);

    // sleep for 2 seconds to simulate processing
    // await new Promise((resolve) => setTimeout(resolve, 5000));

    interface VectorStore {
      loadFile: (filepath: string, filename: string) => Promise<any>;
    }

    const vectorStore: VectorStore = process.env.USE_PGVECTOR === "true" 
      ? { loadFile: loadFileIntoPgVector }
      : { loadFile: loadFileIntoPinecone };
    console.log(vectorStore);
    await vectorStore.loadFile(filepath, filename);
    // console.log("Loaded", pages.length, "pages from", filepath);
    // console.log("First page:", pages[0]);

    // return NextResponse.json({ success: true });

    const chat_id = await db
      .insert(chats)
      .values({
        fileKey: filepath,
        pdfName: filename,
        userId,
      })
      .returning({
        insertedId: chats.id,
      });

    return NextResponse.json(
      {
        chat_id: chat_id[0].insertedId,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
