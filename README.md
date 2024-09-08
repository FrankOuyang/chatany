This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.


# Tech Stack

- Next.js
- Clerk Auth
- DrizzleORM(compatible with Edge Runtime) + NeonDB
- Stripe
- AWS S3
- shadcn/ui(built on top of Tailwind CSS) (radix-ui)

# AI Tech Stack

- PineconeDB
- Langchain
- OpenAI
- Vercel AI SDK

# New Concepts

- Edge Runtime
- Retrieval Augmented Generation (RAG) - most accurate, up-to-date information

# Development

## shadcn/ui

```bash
npx create-next-app@latest --ts
npn run dev

# initialize the configs for styling
npx shadcn@latest init

npx shadcn@latest add button
```

## Clerk Auth

1. create a new account on clerk.com
2. create a new application
3. update `.env`

```bash
npm install @clerk/nextjs
```

## home page

- hypercolor.dev (background gradient)
- icons
    ```bash
    npm install lucide-react
    ```
- typewriter effect
    ```bash
    npx shadcn@latest add "https://v0.dev/chat/b/PnODrXv?token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0.._IonpIws2Tpirwm_.caXzL_Pum53qOoWWfFMfskOzDeftYAkz4EC4B7xIjGFK6LEJCPs.FUCbvRh5xi0Jdp7QoJGW1g"
    ```

## database

- Neon DB - Postgres(update .env)
- Drizzle ORM - `lib/db/index.ts`
    ```bash
    npm install drizzle-orm postgres
    npm install @neondatabase/serverless
    ```
- drizzle-kit (db migration) - `drizzle.config.ts`

    https://orm.drizzle.team/kit-docs/quick
    
    ```bash
    npm install -D drizzle-kit
    npm run generate
    npm run migrate
    ```
## File upload

- install vscode extension `ES7 React/Redux/GraphQL/React-Native snippets`
- `npm install react-dropzone`
- `npx shadcn@latest add progress`
- `npx shadcn@latest add alert`

## AWS S3

- AWS console
- create a s3 bucket: bucket policy and CORS
- `npm install aws-sdk`

## RAG(Reformulated Augmented Generation) 检索增强生成

Vector & Embedding

### Vector

A list of numbers that represent a word or a sentence, [1, 2], 1 represents the x-coordinate, 2 represents the y-coordinate.

3D vectors: x, y, z

cosine similarity: the angle between two vectors

cosine distance: 1 - cosine similarity

```
{
    embedding: [1, 2],
    metadata: { textContent: "hello world" }
}
```

Vector vs. embedding: vector is a list of numbers, embedding is a vector with metadata.

Steps for coding:
1. obtain the file
2. split and segment the file - Langchain
3. convert the file into vectors, vectorize and embed the individual documents
4. store the vectors into vector database(pineconeDB)
--chat with AI---
5. embed the query into a vector
6. query the pineconeDB for similar vectors
7. extract out the metadata of the similar vectors
8. feed metadata into the AI(LLM) prompt to generate the output with the context of the file


## React query setup
```bash
npm install @tanstack/react-query
```