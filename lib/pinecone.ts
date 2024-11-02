import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "./embeddings";
import md5 from "md5";
import { convertToAscii } from "./utils";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export const PineconeIndex = pinecone.index(process.env.PINECONE_INDEX_NAME!);

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

// A helper function that breaks an array into chunks of size batchSize
// const chunks = (array: any[], batchSize = 200) => {
//   const chunks = [];

//   for (let i = 0; i < array.length; i += batchSize) {
//     chunks.push(array.slice(i, i + batchSize));
//   }

//   return chunks;
// };

export async function loadFileIntoPinecone(filePath: string, filename: string) {
  if (!filePath) {
    throw new Error("No file path provided");
  }
  
  const loader = new PDFLoader(filePath);
  const pages = (await loader.load()) as PDFPage[]; // array of documents

  // split and segment the file into smaller documents
  const documents = await Promise.all(pages.map(prepareDocument));

  // vectorize and embed individual documents
  const vectors = await Promise.all(documents.flat().map(embedDocuments));

  // upsert vectors to Pinecone
  const namespace = convertToAscii(filename)
  // const recordChunks = chunks(vectors);

  // console.log("Upserting", vectors.length, "vectors to Pinecone");
  // console.log(vectors);
  // console.log(recordChunks);
  await PineconeIndex.namespace(namespace).upsert(vectors);
  // Upsert data with 200 records per request asynchronously using Promise.all()
  // await Promise.all(recordChunks.map((chunk) => PineconeIndex.namespace(namespace).upsert(chunk)));

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
        text: doc.metadata.text,
        pageNumber: doc?.metadata?.pageNumber,
      },
    } as PineconeRecord;
  } catch (error) {
    console.log("Error embedding document:", error);
    throw error;
  }
}

// truncate a string to a certain number of bytes
export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

// split a single page into multiple documents
async function prepareDocument(page: PDFPage) {
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace(/\n/g, "");
  // split the docs
  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata?.loc?.pageNumber,
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);
  return docs;
}
