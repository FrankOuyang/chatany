import { Client } from 'pg';
import pgvector from 'pgvector/pg';
import { pgConfig, PDFPage } from './constants';
import { getEmbeddings, prepareDocument } from './embeddings';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { Document } from "langchain/document";
import md5 from 'md5';

// export async function initPgVector() {
//   await pgClient.connect();

//   await pgClient.query('CREATE EXTENSION IF NOT EXISTS vector');
//   await pgvector.registerTypes(pgClient);

//   // await client.query('DROP TABLE IF EXISTS documents');
//   // await client.query('CREATE DATABASE chatany');
//   // await client.query('CREATE USER chatany WITH PASSWORD \'zaq12wsx\'');
//   // await client.query('GRANT ALL PRIVILEGES ON DATABASE chatany TO chatany');
//   // await client.query('CREATE TABLE IF NOT EXISTS documents (id bigserial PRIMARY KEY, content text, embedding vector(1024))');

//   const input = [
//     'The dog is barking',
//     'The cat is purring', 
//     'The bear is growling'
//   ];

//   // const openai = new OpenAI();
//   // const response = await openai.embeddings.create({input: input, model: 'text-embedding-3-small'});
//   // const embeddings = response.data.map((v) => v.embedding);

//   for (let i = 0; i < input.length; i++) {
//     await pgClient.query('INSERT INTO documents (content, embedding) VALUES ($1, $2)', [input[i], pgvector.toSql('test')]);
//   }

//   const documentId = 2;
//   const { rows } = await pgClient.query('SELECT * FROM documents WHERE id != $1 ORDER BY embedding <=> (SELECT embedding FROM documents WHERE id = $1) LIMIT 5', [documentId]);
//   for (const row of rows) {
//     console.log(row.content);
//   }

//   await pgClient.end();
// }

export async function loadFileIntoPgVector(filePath: string, filename: string) {
  if (!filePath) {
    throw new Error("No file path provided");
  }

  const loader = new PDFLoader(filePath);
  const pages = (await loader.load()) as PDFPage[];

  const documents = await Promise.all(pages.map(prepareDocument));

  const vectors = await Promise.all(documents.flat().map(doc => embedDocuments(doc, filename)));

  const pgClient = new Client(pgConfig);

  try {
    await pgClient.connect();
    await pgvector.registerTypes(pgClient);
    for (const vector of vectors) {
      await pgClient.query(
        'INSERT INTO documents (fileName, hash, content, pageNumber, embedding) VALUES ($1, $2, $3, $4, $5)', 
        [vector.fileName, vector.hash, vector.content, vector.pageNumber, pgvector.toSql(vector.embeddings)]
      );
    }
  } catch (error) {
    console.log("Error embedding document:", error);
    throw error;
  } finally {
    await pgClient.end();
  }
}

async function embedDocuments(doc: Document, fileName: string) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);
    fileName = fileName.split('/').pop() || fileName;

    return {
      fileName: fileName,
      hash: hash,
      embeddings: embeddings,
      content: doc.pageContent,
      pageNumber: doc?.metadata?.pageNumber,
    }
  } catch (error) {
    console.log("Error embedding document:", error);
    throw error;
  }
}
