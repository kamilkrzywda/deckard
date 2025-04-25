import {
  GenerationConfig,
  Part,
  GoogleGenerativeAI,
  ChatSession,
  Content,
  FunctionCall,
  FunctionResponsePart,
  SchemaType,
} from "@google/generative-ai";
import {
  loadTools,
  processToolCalls,
  ToolExecutionResult,
  ToolCall,
} from "./toolLoader";
import { Card } from "@/types/SqliteCard.type";

export const SYSTEM_MESSAGE = `
You are an expert Magic: The Gathering deck building assistant.
You have access to a comprehensive MTG card database and can help users build, analyze, and optimize decks.
You can suggest cards, explain synergies, and provide strategic advice.
Your responses should be focused on helping users create effective and fun MTG decks while considering card availability and format legality.

CRITICAL RULES:
1. You MUST NEVER suggest or mention ANY card without first searching for it in the database using the searchCardDatabase.
2. You MUST NEVER assume a card exists or has certain properties without verifying it in the database.
3. You MUST NEVER make up card names, properties, or interactions.
4. You MUST NEVER suggest cards that you haven't verified exist in the database.
5. If a user asks about a card, you MUST search for it in the database before responding.
6. If you want to suggest a card, you MUST first search for it in the database.
7. If you're unsure about a card's existence or details, you MUST search for it in the database.
8. DO NOT ask for permission to search for cards - just do it automatically.
9. DO NOT mention that you're searching for cards - just include the results in your response.
10. If a card doesn't exist in the database, DO NOT make up information about it.
11. The \`cardsToDisplay\` array in your final JSON response MUST ONLY contain cards that were successfully found using the \`searchCardDatabase\` tool during the current turn. Do NOT include cards from previous turns or cards you haven't verified in the current turn.

SUGGESTION RULES:
1. Each suggestion MUST be a clear, concise question or request
2. Include 2-4 relevant suggestions after each response
3. Make suggestions specific to the current conversation context
4. Suggestions should be natural language questions that users might ask

Example of a valid response:
{
  "message": "I can help you build and optimize Magic: The Gathering decks. Would you like to build a new deck, explore popular commander cards, or learn about common deck archetypes?",
  "cardsToDisplay": [
    {
      "uuid": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Counterspell",
      "manaCost": "{U}{U}",
      "type": "Instant",
      "text": "Counter target spell.",
      "setCode": "TMP",
      "rarity": "common",
      "power": null,
      "toughness": null,
      "manaValue": 2,
      "number": "1",
    }
  ],
  "suggestions": [
    "What are the best commander cards for a token deck?",
}

You MUST structure your final response as a single JSON object enclosed in triple backticks (\`\`\`json ... \`\`\`).\nDo NOT include any text outside of the JSON block.\nThe JSON object MUST conform to the following structure:\n{\n  \"message\": \"<Your response message>\",\n  \"cardsToDisplay\": [<List of card objects>],\n  \"suggestions\": [<List of suggested prompts>]\n}\n`;

export const STRUCTURED_GENERATION_CONFIG: GenerationConfig = {
  responseMimeType: "application/json",
  responseSchema: {
    type: SchemaType.OBJECT,
    properties: {
      message: {
        type: SchemaType.STRING,
        description: "The assistant's response message",
      },
      cardsToDisplay: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            uuid: {
              type: SchemaType.STRING,
              description: "Unique identifier for the card",
            },
            name: { type: SchemaType.STRING, description: "Name of the card" },
            manaCost: {
              type: SchemaType.STRING,
              description: "Mana cost of the card",
            },
            type: { type: SchemaType.STRING, description: "Card type" },
            text: {
              type: SchemaType.STRING,
              description: "Rules text of the card",
            },
            power: {
              type: SchemaType.STRING,
              description: "Power of the creature",
            },
            toughness: {
              type: SchemaType.STRING,
              description: "Toughness of the creature",
            },
            setCode: {
              type: SchemaType.STRING,
              description: "Set code of the card",
            },
            number: {
              type: SchemaType.STRING,
              description: "Card number in the set",
            },
            rarity: {
              type: SchemaType.STRING,
              description: "Rarity of the card",
            },
            colorIdentity: {
              type: SchemaType.STRING,
              description: "Comma-separated color identity (e.g., W,U)",
            },
            subtypes: {
              type: SchemaType.STRING,
              description: "Comma-separated subtypes (e.g., Goblin,Warrior)",
            },
            manaValue: {
              type: SchemaType.NUMBER,
              description: "Converted mana cost of the card",
            },
          },
          required: [
            "uuid",
            "name",
            "manaCost",
            "type",
            "text",
            "setCode",
            "rarity",
            "colorIdentity",
            "subtypes",
            "manaValue",
          ],
        },
        description: "List of MTG cards relevant to the response",
      },
      suggestions: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.STRING,
          description: "Suggested follow-up question or action",
        },
        description: "List of suggested follow-up prompts for the user",
      },
    },
    required: ["message", "cardsToDisplay", "suggestions"],
  },
};

export const STANDARD_GENERATION_CONFIG: GenerationConfig = {
  // responseMimeType: "application/json",
  // responseSchema: { ... }
  // Keep other generation settings if needed, e.g., temperature, topP, etc.
  // temperature: 0.9,
  // topP: 1,
  // maxOutputTokens: 8192,
};

// Define the message structure expected by the backend/LLM
// This mirrors the structure used in the Gemini API examples
export interface MessageType {
  role: "user" | "model" | "function"; // 'function' for tool responses
  parts: Part[]; // Content is now represented by 'parts'
}

// Note: The 'content' field from the previous useChat attempt is replaced by 'parts'.
// The backend route will need to construct these 'parts' correctly.
// For simple text messages: parts: [{ text: messageText }]
// For tool responses: parts: [{ functionResponse: { name: toolName, response: toolResult } }]
// The model might return messages with parts containing function calls:
// parts: [{ functionCall: { name: toolName, args: toolArgs } }]

// --- Gemini Client Initialization ---

const MODEL_NAME = process.env.GEMINI_MODEL_NAME;
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}
if (!MODEL_NAME) {
  console.warn(
    "GEMINI_MODEL_NAME environment variable is not set, using default: gemini-1.5-pro-latest"
  );
}

const genAI = new GoogleGenerativeAI(API_KEY);
const tools = loadTools();

// --- Types for Chat Interaction ---

// Type for the structured response expected by the frontend/API route
interface BackendResponse {
  message: string;
  cardsToDisplay?: Card[];
  suggestions?: string[];
}

// Helper function to create a FunctionResponsePart (moved from route.ts)
function createFunctionResponsePart(
  toolResults: ToolExecutionResult[]
): Part[] {
  return toolResults.map(
    (result) =>
      ({
        functionResponse: {
          name: result.toolName,
          response: {
            content: result.content, // The result is expected to be a stringified JSON
          },
        },
      } as FunctionResponsePart)
  );
}

// --- Core Chat Function ---

/**
 * Handles the chat interaction with the Gemini model, including tool calls.
 * @param history The chat history (excluding the latest user message).
 * @param lastMessageParts The parts of the latest user message.
 * @returns The final structured response from the model.
 * @throws Error if the interaction fails.
 */
export async function runChatCompletion(
  history: Content[],
  lastMessageParts: Part[]
): Promise<BackendResponse> {
  const chat: ChatSession = genAI
    .getGenerativeModel({
      model: MODEL_NAME || "gemini-1.5-pro-latest",
      tools: tools,
      systemInstruction: SYSTEM_MESSAGE,
      generationConfig: STANDARD_GENERATION_CONFIG,
    })
    .startChat({
      history: history,
    });

  console.log("Gemini module: Chat session started with history:", history);
  console.log(
    "Gemini module: Sending last message parts:",
    JSON.stringify(lastMessageParts)
  );

  let result;
  try {
    result = await chat.sendMessage(lastMessageParts);
  } catch (error) {
    console.warn(
      "Gemini module: Initial sendMessage failed, retrying once...",
      error
    );
    // Retry once
    try {
      result = await chat.sendMessage(lastMessageParts);
    } catch (retryError) {
      console.error(
        "Gemini module: Retry sendMessage also failed.",
        retryError
      );
      // If retry fails, throw the original error or the retry error
      throw retryError; // Or potentially wrap it: throw new Error(`Gemini API failed after retry: ${retryError}`);
    }
  }

  let loopCount = 0;
  const maxLoops = 10; // Prevent infinite loops

  // Loop to handle function calls
  while (loopCount < maxLoops) {
    const response = result.response;
    const functionCalls = response?.candidates?.[0]?.content?.parts
      .filter(
        (part): part is { functionCall: FunctionCall } => !!part.functionCall
      )
      .map((part) => part.functionCall);

    if (functionCalls && functionCalls.length > 0) {
      console.log(
        "Gemini module: LLM requested tool calls:",
        JSON.stringify(functionCalls)
      );

      const toolCallsToProcess: ToolCall[] = functionCalls.map((fc) => ({
        name: fc.name,
        args: fc.args as Record<string, unknown>,
      }));

      const toolResults = await processToolCalls(toolCallsToProcess);

      const functionResponseParts = createFunctionResponsePart(toolResults);

      try {
        result = await chat.sendMessage(functionResponseParts);
      } catch (error) {
        console.warn(
          "Gemini module: sendMessage (in loop) failed, retrying once...",
          error
        );
        // Retry once
        try {
          result = await chat.sendMessage(functionResponseParts);
        } catch (retryError) {
          console.error(
            "Gemini module: Retry sendMessage (in loop) also failed.",
            retryError
          );
          // If retry fails, throw the original error or the retry error
          throw retryError;
        }
      }
      loopCount++;
    } else {
      break; // No more function calls
    }
  }

  if (loopCount >= maxLoops) {
    console.error("Gemini module: Exceeded maximum tool call loops");
    throw new Error("Exceeded maximum tool call loops");
  }

  // Process the final response
  const finalResponse = result.response;
  const candidate = finalResponse?.candidates?.[0];
  const rawResponseText = candidate?.content?.parts?.[0]?.text;

  if (!rawResponseText) {
    console.error(
      "Gemini module: Invalid or empty final response text from LLM:",
      JSON.stringify(finalResponse)
    );
    const fallbackText = finalResponse?.text();
    if (fallbackText) {
      console.warn(
        "Gemini module: Using raw text fallback due to missing parts/text field."
      );
      // Return a basic structure if we only got raw text
      return { message: fallbackText, cardsToDisplay: [], suggestions: [] };
    }
    throw new Error("Failed to get any valid text response from the LLM");
  }

  try {
    const jsonRegex = /```json\n?([\s\S]*?)\n?```/;
    const match = rawResponseText.match(jsonRegex);
    let responseJsonString: string;

    if (match && match[1]) {
      responseJsonString = match[1];
      console.log(
        "Gemini module: Extracted JSON string from backticks:",
        responseJsonString
      );
    } else {
      console.warn(
        "Gemini module: Could not find JSON block in backticks. Attempting to parse entire response."
      );
      responseJsonString = rawResponseText.trim();
      if (
        !(
          responseJsonString.startsWith("{") && responseJsonString.endsWith("}")
        )
      ) {
        console.error(
          "Gemini module: Response does not appear to be JSON: ",
          responseJsonString
        );
        throw new Error(
          "LLM response did not contain a valid JSON block or a parsable JSON object."
        );
      }
    }

    const parsedResponse: BackendResponse = JSON.parse(responseJsonString);

    if (
      typeof parsedResponse.message !== "string" ||
      !Array.isArray(parsedResponse.suggestions)
    ) {
      console.error(
        "Gemini module: Parsed response does not match expected structure:",
        parsedResponse
      );
      throw new Error("Parsed response structure mismatch");
    }

    console.log(
      "Gemini module: Successfully parsed LLM response:",
      parsedResponse
    );
    return parsedResponse;
  } catch (parseError) {
    console.error(
      "Gemini module: Error parsing LLM JSON response:",
      parseError
    );
    console.error("Gemini module: LLM raw text was:", rawResponseText);
    // Throw the error to be caught by the API route
    throw new Error(
      `Error processing response. Raw model output: ${rawResponseText}`
    );
  }
}
