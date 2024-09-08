"use server";

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function saveFile(formData: FormData) {
  const file = formData.get("file") as File;
  const decodedFileName = Buffer.from(file.name, "binary").toString("utf-8");
  const buffer = Buffer.from(await file.arrayBuffer());

  const now = new Date();
  const dateString = now
    .toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, "-");
  const filename =
    crypto.randomBytes(16).toString("hex") +
    "-" +
    decodedFileName.replace(/\s/g, "-");
  const directory = path.join(process.cwd(), "uploads", dateString);
  const filepath = path.join(directory, filename);

  try {
    await mkdir(directory, { recursive: true });
    await writeFile(filepath, buffer);
    console.log(`File saved to ${filepath}`);
    return {
      success: true,
      filepath,
      file_name: filename,
    };
  } catch (error) {
    console.error("Error saving file:", error);
    return { error: "Failed to save the file." };
  }
}
