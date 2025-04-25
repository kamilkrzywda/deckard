import { Tool } from "@google/generative-ai";
import { cardDatabaseTool, CardDatabaseToolParams } from "./cardDatabaseTool";
import { searchCardDatabase } from "./cardDatabaseTool";
import { keywordTool, KeywordToolParams } from "./keywordTool";
import { lookupKeyword } from "./keywordTool";
import { comboSearchTool } from "./comboSearchTool";
// Define a type for tool execution results
export interface ToolExecutionResult {
  toolName: string;
  content: string;
}

// Define a type for tool call
export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
}

// Define a type for tool response
export interface ToolResponse {
  toolCalls: ToolCall[];
}

// Map of available tools
export const availableTools: Record<string, Tool> = {
  searchCardDatabase: cardDatabaseTool,
  lookupKeyword: keywordTool,
  searchCombos: comboSearchTool,
};

// Define a type for tool executor functions
type ToolExecutor = (args: unknown) => Promise<unknown>;

// Map of tool execution functions
const toolExecutors: Record<string, ToolExecutor> = {
  searchCardDatabase: (args: unknown) =>
    searchCardDatabase(args as CardDatabaseToolParams),
  lookupKeyword: (args: unknown) => lookupKeyword(args as KeywordToolParams),
};

/**
 * Loads all available tools for the LLM
 * @returns Array of tools
 */
export function loadTools(): Tool[] {
  return Object.values(availableTools);
}

/**
 * Executes a tool call and returns the result
 * @param toolCall The tool call to execute
 * @returns Promise resolving to the tool execution result
 */
export async function executeToolCall(
  toolCall: ToolCall
): Promise<ToolExecutionResult> {
  const executor = toolExecutors[toolCall.name];
  if (!executor) {
    console.error(`No executor found for tool: ${toolCall.name}`);
    return {
      toolName: toolCall.name,
      content: `Error: No executor found for tool: ${toolCall.name}`,
    };
  }

  try {
    console.log("Executing tool:", toolCall.name);
    const result = await executor(toolCall.args);
    console.log("Tool execution complete for:", toolCall.name);

    return {
      toolName: toolCall.name,
      content: JSON.stringify(result),
    };
  } catch (error) {
    console.error("Error executing tool:", error);
    return {
      toolName: toolCall.name,
      content: `Error executing tool ${toolCall.name}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

/**
 * Processes multiple tool calls and returns their results
 * @param toolCalls Array of tool calls to execute
 * @returns Promise resolving to array of tool execution results
 */
export async function processToolCalls(
  toolCalls: ToolCall[]
): Promise<ToolExecutionResult[]> {
  const results: ToolExecutionResult[] = [];

  for (const toolCall of toolCalls) {
    const result = await executeToolCall(toolCall);
    results.push(result);
  }

  return results;
}
