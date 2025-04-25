import { Tool, SchemaType } from "@google/generative-ai";
import { keywords } from "@/types/keywords";

// Define the tool for looking up keywords
export const keywordTool: Tool = {
  functionDeclarations: [
    {
      name: "lookupKeyword",
      description:
        "This tool provides detailed information about Magic: The Gathering keywords and abilities. It can be used to understand card mechanics and rules.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          keyword: {
            type: SchemaType.STRING,
            description:
              "The keyword to look up. If not provided, returns all available keywords.",
          },
        },
        required: [],
      },
    },
  ],
};

// Define the interface for the tool's input parameters
export interface KeywordToolParams {
  keyword?: string;
}

// Function to look up keywords
export async function lookupKeyword(
  params: KeywordToolParams
): Promise<string> {
  if (params.keyword) {
    // Search for the specific keyword
    const keywordLower = params.keyword.toLowerCase();
    const lines = keywords.split("\n");

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(keywordLower)) {
        // Found the keyword, return the section
        let result = lines[i];
        let j = i + 1;
        while (j < lines.length && !lines[j].startsWith("*")) {
          result += "\n" + lines[j];
          j++;
        }
        return result;
      }
    }
    return `Keyword "${params.keyword}" not found in the database.`;
  } else {
    // Return all keywords
    return keywords;
  }
}
