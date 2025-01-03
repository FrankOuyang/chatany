import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Document } from "@pinecone-database/doc-splitter";
import { getEmbeddings, prepareDocument } from "./embeddings";
import md5 from "md5";
import { convertToAscii } from "./utils";
import { PDFPage } from "./constants";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export const PineconeIndex = pinecone.index(process.env.PINECONE_INDEX_NAME!);

export async function loadFileIntoPinecone(filePath: string, filename: string) {
  if (!filePath) {
    throw new Error("No file path provided");
  }
  
  const loader = new PDFLoader(filePath);
  const pages = (await loader.load()) as PDFPage[]; // array of documents

  // split and segment the file into smaller documents
  // list of pages, each page is a list of documents
  const documents = await Promise.all(pages.map(prepareDocument));

  // vectorize and embed individual documents(1000 bytes)
  const vectors = await Promise.all(documents.flat().map(embedDocuments));

  // upsert vectors to Pinecone
  const namespace = convertToAscii(filename)
  // const recordChunks = chunks(vectors);

  // console.log("Upserting", vectors.length, "vectors to Pinecone");
  // console.log(vectors);
  // console.log(recordChunks);
  await PineconeIndex.namespace(namespace).upsert(vectors);

  return documents[0];
}

async function embedDocuments(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);

    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.pageContent,
        pageNumber: doc?.metadata?.pageNumber,
      },
    } as PineconeRecord;
  } catch (error) {
    console.log("Error embedding document:", error);
    throw error;
  }
}
