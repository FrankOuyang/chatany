import { PineconeIndex } from "./pinecone";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";

type Metadata = {
  text: string;
  pageNumber: number;
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

export async function getMatchesFromEmbeddings(
  embeddings: number[],
  filename: string,
) {
  try {
    const namespace = convertToAscii(filename).split('/').pop() || filename;
    console.log("[NAMESPACE]", namespace);

    const queryResponse = await PineconeIndex.namespace(namespace).query({
      vector: embeddings,
      topK: 8,
      includeMetadata: true,
    });

    return queryResponse.matches || [];
  } catch (error) {
    console.error("Error fetching from Pinecone:", error);
    throw new Error(`Failed to fetch matches: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getContext(query: string, filename: string) {
  try {
    const queryEmbeddings = await getEmbeddings(query);
    const matches = await getMatchesFromEmbeddings(queryEmbeddings, filename);

    // Normalize and validate scores
    const validMatches = matches.map(match => ({
      ...match,
      score: match.score || 0, // Ensure score is never undefined
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
        pageNumber: (m.metadata as Metadata).pageNumber,
        previewText: ((m.metadata as Metadata).text || '').substring(0, 100) + '...'
      }))
    });

    // Sort matches by score and page number
    const sortedDocs = qualifyingMatches
      .sort((a, b) => {
        const scoreDiff = b.score - a.score;
        if (Math.abs(scoreDiff) < 0.1) { // Consider scores within 0.1 as roughly equal
          return ((a.metadata as Metadata).pageNumber || 0) - 
                 ((b.metadata as Metadata).pageNumber || 0);
        }
        return scoreDiff;
      })
      .map(match => (match.metadata as Metadata).text);

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
