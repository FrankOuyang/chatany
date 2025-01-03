import OpenAI from "openai";

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
