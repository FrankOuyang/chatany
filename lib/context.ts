import { PineconeIndex } from "./pinecone";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";
import { Client } from 'pg';
import { pgConfig } from './constants';
import pgvector from 'pgvector/pg';

type Metadata = {
  text: string;
  pageNumber: number;
}

type VectorMatch = {
  id?: string;
  score: number;
  metadata: Metadata;
}

// Constants for score thresholds
const SCORE_THRESHOLDS = {
  EXCELLENT: 0.8,    // Very high confidence match
  GOOD: 0.6,        // Good confidence match
  MINIMUM: 0.3,     // Minimum acceptable score
  ADAPTIVE_RATIO: 0.7 // For adaptive threshold calculation
} as const;

// Helper function to calculate adaptive threshold
function calculateAdaptiveThreshold(scores: number[]): number {
  if (!scores.length) return SCORE_THRESHOLDS.MINIMUM;
  
  const highestScore = Math.max(...scores);
  const adaptiveThreshold = highestScore * SCORE_THRESHOLDS.ADAPTIVE_RATIO;
  
  // Use the higher of minimum threshold or adaptive threshold
  return Math.max(
    SCORE_THRESHOLDS.MINIMUM,
    Math.min(adaptiveThreshold, SCORE_THRESHOLDS.EXCELLENT)
  );
}

async function getMatchesFromPinecone(
  embeddings: number[],
  filename: string,
): Promise<VectorMatch[]> {
  try {
    const namespace = convertToAscii(filename).split('/').pop() || filename;
    console.log("[PINECONE_NAMESPACE]", namespace);

    const queryResponse = await PineconeIndex.namespace(namespace).query({
      vector: embeddings,
      topK: 8,
      includeMetadata: true,
    });

    return (queryResponse.matches || []).map(match => ({
      score: match.score || 0,
      metadata: match.metadata as Metadata
    }));
  } catch (error) {
    console.error("Error fetching from Pinecone:", error);
    throw new Error(`Failed to fetch Pinecone matches: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function getMatchesFromPgVector(
  embeddings: number[],
  filename: string,
): Promise<VectorMatch[]> {
  const pgClient = new Client(pgConfig);
  try {
    await pgClient.connect();
    await pgvector.registerType(pgClient);
    
    const fileName = convertToAscii(filename).split('/').pop() || filename;
    console.log("[PGVECTOR_FILENAME]", fileName);

    // Query similar vectors using cosine similarity
    const { rows } = await pgClient.query(
      `SELECT 
        content as text,
        pageNumber as "pageNumber",
        1 - (embedding <=> $1) as score
      FROM documents 
      WHERE fileName = $2
      ORDER BY embedding <=> $1
      LIMIT 8`,
      [pgvector.toSql(embeddings), fileName]
    );

    return rows.map(row => ({
      score: row.score,
      metadata: {
        text: row.text,
        pageNumber: row.pageNumber
      }
    }));
  } catch (error) {
    console.error("Error fetching from pgvector:", error);
    throw new Error(`Failed to fetch pgvector matches: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    await pgClient.end();
  }
}

export async function getMatchesFromEmbeddings(
  embeddings: number[],
  filename: string,
): Promise<VectorMatch[]> {
  const usesPgVector = process.env.USE_PGVECTOR === "true";
  return usesPgVector 
    ? getMatchesFromPgVector(embeddings, filename)
    : getMatchesFromPinecone(embeddings, filename);
}

export async function getContext(query: string, filename: string) {
  try {
    const queryEmbeddings = await getEmbeddings(query);
    const matches = await getMatchesFromEmbeddings(queryEmbeddings, filename);

    // Normalize and validate scores
    const validMatches = matches.map(match => ({
      ...match,
      score: match.score || 0,
    }));

    // Calculate adaptive threshold based on actual scores
    const threshold = calculateAdaptiveThreshold(
      validMatches.map(m => m.score)
    );

    // Filter and categorize matches
    const qualifyingMatches = validMatches
      .filter(match => match.score > threshold)
      .map(match => ({
        ...match,
        confidence: match.score >= SCORE_THRESHOLDS.EXCELLENT ? 'excellent' :
                   match.score >= SCORE_THRESHOLDS.GOOD ? 'good' : 'fair'
      }));

    // Enhanced logging with match quality information
    console.log({
      query,
      filename,
      embeddingsLength: queryEmbeddings.length,
      matchesCount: {
        total: matches.length,
        qualifying: qualifyingMatches.length
      },
      threshold,
      matches: qualifyingMatches.map(m => ({
        score: m.score.toFixed(3),
        confidence: m.confidence,
        pageNumber: m.metadata.pageNumber,
        previewText: (m.metadata.text || '').substring(0, 100) + '...'
      }))
    });

    // Sort matches by score and page number
    const sortedDocs = qualifyingMatches
      .sort((a, b) => {
        const scoreDiff = b.score - a.score;
        if (Math.abs(scoreDiff) < 0.1) { // Consider scores within 0.1 as roughly equal
          return (a.metadata.pageNumber || 0) - (b.metadata.pageNumber || 0);
        }
        return scoreDiff;
      })
      .map(match => match.metadata.text);

    // Join with double newline and limit context length
    const context = sortedDocs.join("\n\n");
    return context.length > 3000 ? 
           context.substring(0, 2997) + "..." : 
           context;

  } catch (error) {
    console.error("Error getting context:", error);
    throw new Error("Failed to get context for query");
  }
}
