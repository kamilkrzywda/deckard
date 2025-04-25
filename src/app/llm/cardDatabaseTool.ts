import { Tool, SchemaType } from "@google/generative-ai";
import prisma, { Card, Prisma } from "@/app/prisma";

// Define the tool for the LLM (Gemini format)
export const cardDatabaseTool: Tool = {
  functionDeclarations: [
    {
      name: "searchCardDatabase",
      description: `This tool searches the Magic: The Gathering card database using Prisma query capabilities.
        PERFORMANCE: This database search is very fast. Do not hesitate to use it frequently whenever you need to verify card details, find examples, or search for cards based on any criteria. However, always try to combine related searches into a single query (e.g., using OR for multiple names, or AND for multiple criteria) for maximum efficiency.
        IMPORTANT: If a card name is mentioned in the user's input, you MUST use this tool to search for that card's information.
        The 'where' parameter accepts any valid Prisma.CardWhereInput format, allowing for complex queries with AND, OR, NOT conditions, and various comparison operators.
        Results are limited to a maximum of 200 cards. For string fields, use the contains operator in the format: where: { field: { contains: 'text' } }.

        SEARCHING CARD TYPES:
        - Use the 'type' field (singular) to search the full type line (e.g., 'Legendary Creature — Goblin').
        - Use 'type: { contains: "Legendary Creature" }' to find all legendary creatures.
        - The 'types' field (plural) contains comma-separated individual types (e.g., 'Legendary,Creature,Goblin'). While usable with AND/contains for single types, searching the singular 'type' field is often more reliable for combined types.

        SEARCHING COMMA-SEPARATED FIELDS (Colors, Color Identity, Keywords):
        - Fields like 'colors', 'colorIdentity', and 'keywords' are comma-separated strings (e.g., 'W,U,B', 'Flying,Vigilance').
        - To search these, you MUST search for EACH value separately using 'contains', typically combined with 'AND'.
        - Example 1 (Keywords): To find cards with Flying AND Vigilance, use { AND: [ { keywords: { contains: 'Flying' } }, { keywords: { contains: 'Vigilance' } } ] }.
        - Example 2 (Combined Search): To find Blue/Red Legendary Creatures (Izzet Commanders):
          { AND: [
            { colorIdentity: { contains: 'U' } },
            { colorIdentity: { contains: 'R' } },
            { type: { contains: 'Legendary Creature' } } // Use singular 'type' here
          ] }
        - DO NOT search for combined values in a single string like { keywords: { contains: 'Flying,Vigilance' } }.

        SEARCHING FOR MULTIPLE SPECIFIC CARDS (by Name):
        - To search for several specific cards at once, use the 'OR' operator with 'name: { contains: ... }'.
        - Example: To find 'Sol Ring' OR 'Arcane Signet':
          { OR: [
            { name: { contains: 'Sol Ring' } },
            { name: { contains: 'Arcane Signet' } }
          ] }

        Colors vs. Color Identity:
        - 'colors': Derived strictly from mana symbols in the mana cost.
        - 'colorIdentity': Includes mana symbols in the mana cost AND any symbols in the rules text. Use 'colorIdentity' for broader searches like Commander deck building.`,
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          where: {
            type: SchemaType.OBJECT,
            description: `Filtering conditions using Prisma format. Use fields like 'name', 'type', 'text', 'manaValue', 'colors', 'colorIdentity'. Use 'contains' for partial text matches. Use 'AND', 'OR', 'NOT' for complex logic. See main description for handling comma-separated fields ('colors', 'colorIdentity', 'keywords', 'types').`,
            properties: {
              // Core Fields
              name: {
                type: SchemaType.STRING,
                description:
                  "Card name (use 'contains'). E.g., 'Braids, Arisen Nightmare'.",
              },
              type: {
                type: SchemaType.STRING,
                description:
                  "Full card type line (e.g., 'Legendary Creature — Nightmare', 'Instant'). Use 'contains' for combined types like 'Legendary Creature'.",
              },
              text: {
                type: SchemaType.STRING,
                description:
                  "Rules text (use 'contains'). E.g., 'Counter target spell.'.",
              },
              manaValue: {
                type: SchemaType.NUMBER,
                description: "Converted mana cost (numeric). E.g., 3, 2.",
              },
              power: {
                type: SchemaType.STRING,
                description:
                  "Creature power (as text). E.g., '3', null for non-creatures.",
              },
              toughness: {
                type: SchemaType.STRING,
                description:
                  "Creature toughness (as text). E.g., '3', null for non-creatures.",
              },
              rarity: {
                type: SchemaType.STRING,
                description:
                  "Card rarity (e.g., 'rare', 'common'). Use 'equals'.",
              },
              setCode: {
                type: SchemaType.STRING,
                description: "Set code (e.g., 'DMU', 'TMP'). Use 'equals'.",
              },
              edhrecRank: {
                type: SchemaType.NUMBER,
                description:
                  "EDHREC rank (lower is more popular). E.g., 317, 19.",
              },

              // Comma-Separated String Fields (See main description for querying)
              colors: {
                type: SchemaType.STRING,
                description:
                  "Card colors based on mana cost (e.g., 'W,U,B'). Query using AND/contains for each color.",
              },
              colorIdentity: {
                type: SchemaType.STRING,
                description:
                  "Card color identity including mana cost and rules text symbols (e.g., 'W,U,B'). Query using AND/contains for each color.",
              },
              keywords: {
                type: SchemaType.STRING,
                description:
                  "Card keywords (e.g., 'Flying,Vigilance'). Query using AND/contains for each keyword.",
              },
              types: {
                type: SchemaType.STRING,
                description:
                  "Individual card types, comma-separated (e.g., 'Legendary,Creature,Elf'). Use with caution for combined searches; prefer the singular 'type' field.",
              },
            },
          },
          take: {
            type: SchemaType.NUMBER,
            description: "Maximum number of cards to return (limited to 200)",
          },
          orderBy: {
            type: SchemaType.OBJECT,
            description:
              "Order by configuration for the results. Use this to sort the cards by a specific field. If no orderBy is provided, the cards will be returned in no particular order.",
            properties: {
              field: {
                type: SchemaType.STRING,
                description:
                  "Field to order by (e.g. 'name', 'manaValue', 'power', 'toughness')",
              },
              direction: {
                type: SchemaType.STRING,
                description: "Order direction ('asc' or 'desc')",
                enum: ["asc", "desc"],
                format: "enum",
              },
            },
          },
        },
        required: ["where", "take"],
      },
    },
  ],
};

// Define the interface for the tool's input parameters
export interface CardDatabaseToolParams {
  where?: Prisma.CardWhereInput;
  take?: number;
  orderBy?: {
    field: string;
    direction: "asc" | "desc";
  };
}

// Function to query the card database
export async function searchCardDatabase(
  params: CardDatabaseToolParams
): Promise<Card[]> {
  try {
    const query: Prisma.CardFindManyArgs = {
      select: {
        name: true,
        type: true,
        text: true,
        manaCost: true,
        power: true,
        toughness: true,
        rarity: true,
        setCode: true,
        number: true,
        manaValue: true,
        edhrecRank: true,
        edhrecSaltiness: true,
        colorIdentity: true,
        subtypes: true,
        uuid: true,
        types: true,
      },
      where: params.where || {},
      orderBy: params.orderBy
        ? { [params.orderBy.field]: params.orderBy.direction || "asc" }
        : {},
      take: Math.min(params.take || 200, 200),
    };

    const cards = await prisma.card.findMany(query);
    console.log("Found cards:", cards.length);
    return cards as Card[];
  } catch (error) {
    console.error("Error querying card database:", error);
    throw error;
  }
}
