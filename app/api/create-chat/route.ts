import { NextResponse } from "next/server";

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();
    const { filepath, filename } = body;
    console.log("Creating chat with", filepath, filename);
    // sleep for 2 seconds to simulate processing
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
