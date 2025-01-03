// import OpenAI from "openai";
// import { OpenAIStream, StreamingTextResponse } from "ai";
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { Message } from 'ai';
import { getContext } from '@/lib/context';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { chats, messages as messagesSchema } from '@/lib/db/schema';
import { NextResponse } from 'next/server';

// Create a custom OpenAI instance with DashScope compatible endpoint
// const openai = new OpenAI({
const openai = createOpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY!,  // Use non-null assertion as this is required
    baseURL: process.env.DASHSCOPE_BASE_URL!,
    compatibility: "strict" // enable strict mode for streaming token usage
});

// Type for request body
interface ChatRequest {
    messages: Message[];
    model: string;
    chatId: number;
}

export async function POST(req: Request) {
    try {
        // Validate request
        if (!req.body) {
            return new Response("Request body is required", { 
                status: 400,
                statusText: "Bad Request" 
            });
        }

        const { messages, model, chatId }: ChatRequest = await req.json();

        // Validate messages
        if (!Array.isArray(messages) || messages.length === 0) {
            return new Response("Messages array is required and cannot be empty", { 
                status: 400,
                statusText: "Bad Request"
            });
        }

        // Get chat from database
        const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
        if (!_chats || _chats.length != 1) {
            return NextResponse.json({ error: "Chat not found" }, { status: 404 });
        }

        // Get last message and its context based on chatId
        const lastMessage = messages[messages.length - 1];
        const context = await getContext(lastMessage.content, _chats[0].fileKey);
        console.log("[CONTEXT]", context);

        const prompt: Message = {
            id: "system",
            role: "system",
            content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
            The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
            AI is a well-behaved and well-mannered individual.
            AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
            AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
            AI assistant is a big fan of Pinecone and Vercel.
            START CONTEXT BLOCK
            ${context}
            END OF CONTEXT BLOCK
            AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
            If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
            AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
            AI assistant will not invent anything that is not drawn directly from the context.
            `
        };

        // const response = await openai.chat.completions.create({
        const response = await streamText({
            model: openai(model),
            messages: [
                prompt,
                ...messages.filter((message: Message) => message.role === "user")
                // ...messages
            ],
            temperature: 0.7, // Controls the randomness of the response.
            maxTokens: 1000, // Maximum number of tokens to generate.
            presencePenalty: 0.6, // Encourage more diverse responses
            frequencyPenalty: 0.5, // Reduce repetition
            onFinish: async (completion) => {
                console.log({
                    promptTokens: completion.usage.promptTokens,
                    completionTokens: completion.usage.completionTokens,
                    totalTokens: completion.usage.totalTokens
                });

                // Save user message to database
                await db.insert(messagesSchema).values({
                    chatId,
                    content: lastMessage.content,
                    role: "user"
                });

                // Save assistant message to database
                await db.insert(messagesSchema).values({
                    chatId,
                    content: completion.text,
                    role: "assistant"
                });
            }
        });

        // const stream = OpenAIStream(response);
        // return new StreamingTextResponse(stream);
        return response.toDataStreamResponse();
    } catch (error) {
        console.error("[CHAT_ERROR]", error);
        
        // Improved error handling with more specific messages
        if (error instanceof Error) {
            const statusCode = 'status' in error ? (error as any).status : 500;
            const message = error.message || "An internal server error occurred.";
            
            return new Response(JSON.stringify({ 
                error: message,
                timestamp: new Date().toISOString()
            }), { 
                status: statusCode,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        return new Response(JSON.stringify({
            error: "An unexpected error occurred.",
            timestamp: new Date().toISOString()
        }), { 
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
