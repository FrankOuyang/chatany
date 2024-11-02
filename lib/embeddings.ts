import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

// convert a string into a vector
// Pinecone indexes must be created with a dimension that matches the model’s embedding dimension.
// The dimension of an index cannot be changed after creation.
export async function getEmbeddings(text: string, dimensions: number = 1024) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-v3",
      input: text.replace(/\n/g, " "),
      dimensions: dimensions,
    });
    const result = await response.data[0];
    return result.embedding as number[];
  } catch (error) {
    console.error("Error calling openai embedding API:", error);
    throw error;
  }
}
