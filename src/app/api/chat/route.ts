import { NextResponse } from 'next/server';
import { Content } from '@google/generative-ai'; // Keep Content type for history conversion
import { runChatCompletion } from '@/app/llm/gemini'; // Import the new function
// Remove unused Gemini/tool imports: GoogleGenerativeAI, ChatSession, Part, FunctionCall, FunctionResponsePart, SYSTEM_MESSAGE, STANDARD_GENERATION_CONFIG, loadTools, processToolCalls, ToolExecutionResult, ToolCall
import { Card } from '@/types/SqliteCard.type'; // Keep Card type

// Remove Gemini client initialization logic (API_KEY, MODEL_NAME, genAI, tools)

// --- Types (Keep Frontend/Request/Backend types) ---

// Type for the structure expected from the frontend
interface FrontendMessage {
    role: 'user' | 'assistant'; // Matches useChat DisplayMessage sender
    content: string;
}

// Type for the request body
interface RequestBody {
    messages: FrontendMessage[];
}

// Type for the structured response expected by the frontend / returned by runChatCompletion
interface BackendResponse {
    message: string;
    cardsToDisplay?: Card[];
    suggestions?: string[];
}

// --- Helper Functions (Keep history converter, remove createFunctionResponsePart) ---

// Helper function to convert frontend message history to LLM history format
function convertFrontendHistoryToLLM(history: FrontendMessage[]): Content[] {
    return history.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
    }));
}

// --- API Route Handler ---

export async function POST(req: Request) {
    try {
        const body: RequestBody = await req.json();
        const frontendHistory = body.messages;

        if (!frontendHistory || frontendHistory.length === 0) {
            return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
        }

        // Convert frontend history to LLM format
        const llmHistory = convertFrontendHistoryToLLM(frontendHistory);

        // Extract history and the last message parts
        const historyForLLM = llmHistory.slice(0, -1);
        const lastMessage = llmHistory[llmHistory.length - 1];

        if (!lastMessage || lastMessage.role !== 'user' || !lastMessage.parts) {
            console.error('API Route: Last message is missing, not from user, or has no parts:', lastMessage);
            return NextResponse.json({ error: 'Invalid message sequence' }, { status: 400 });
        }

        // Call the centralized chat function
        const finalResponse: BackendResponse = await runChatCompletion(
            historyForLLM,
            lastMessage.parts
        );

        // Return the successful response
        return NextResponse.json({ response: finalResponse });

    } catch (error) {
        // Handle errors thrown from runChatCompletion or other issues
        console.error('Error in /api/chat POST handler:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        // Avoid exposing verbose internal errors like the raw model output in the final user-facing error
        const userFriendlyErrorMessage = errorMessage.startsWith('Error processing response.')
            ? "Sorry, I encountered an issue processing the response from the AI."
            : `Internal Server Error: ${errorMessage}`;

        return NextResponse.json({ error: userFriendlyErrorMessage }, { status: 500 });
    }
}