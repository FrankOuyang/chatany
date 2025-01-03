import OpenAI from "openai";
import { PDFPage } from "./constants";
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";


// Initialize OpenAI client with environment variables
const openai = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: process.env.DASHSCOPE_BASE_URL,
});

/**
 * Converts text into vector embeddings using OpenAI's embedding model
 * @param text - The input text to convert to embeddings
 * @param dimensions - The dimension size for the embeddings (default: 1024)
 * @returns Promise<number[]> - Array of embedding values
 * @throws Error if the OpenAI API call fails
 */
export async function getEmbeddings(text: string, dimensions: number = 1024): Promise<number[]> {
  if (!text) {
    throw new Error("Input text cannot be empty");
  }

  try {
    // Normalize text by replacing newlines with spaces and trimming
    const normalizedText = text.replace(/\n/g, " ").trim();

    const response = await openai.embeddings.create({
      model: "text-embedding-v3",
      input: normalizedText,
      dimensions: dimensions,
    });

    if (!response.data?.[0]?.embedding) {
      throw new Error("Invalid response from OpenAI API");
    }

    return response.data[0].embedding;

  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// split a single page into multiple documents
export async function prepareDocument(page: PDFPage) {
  let { pageContent, metadata } = page;
  
  // Clean and normalize the text content
  pageContent = pageContent.replace(/\n/g, " ").trim(); // Replace newlines with spaces and trim
  pageContent = pageContent.replace(/\s+/g, " "); // Normalize multiple spaces
  
  // Configure the text splitter with optimal chunk settings
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata?.loc?.pageNumber,
        totalLength: pageContent.length,
        createdAt: new Date().toISOString(),
      },
    }),
  ]);

  return docs;
}
