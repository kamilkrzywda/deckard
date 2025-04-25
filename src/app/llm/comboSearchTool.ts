import { Tool, SchemaType } from "@google/generative-ai";

// Define interfaces for the response types
interface Card {
  id: number;
  name: string;
  oracleId: string;
  spoiler: boolean;
  typeLine: string;
}

interface ComboCardUse {
  card: Card;
  zoneLocations: string[];
  battlefieldCardState: string;
  exileCardState: string;
  libraryCardState: string;
  graveyardCardState: string;
  mustBeCommander: boolean;
  quantity: number;
}

interface Feature {
  id: number;
  name: string;
  uncountable: boolean;
  status: string;
}

interface ComboFeatureProduced {
  feature: Feature;
  quantity: number;
}

interface ComboReference {
  id: number;
}

interface ComboLegalities {
  commander: boolean;
  pauperCommanderMain: boolean;
  pauperCommander: boolean;
  oathbreaker: boolean;
  predh: boolean;
  brawl: boolean;
  vintage: boolean;
  legacy: boolean;
  premodern: boolean;
  modern: boolean;
  pioneer: boolean;
  standard: boolean;
  pauper: boolean;
}

interface ComboPrices {
  tcgplayer: string;
  cardkingdom: string;
  cardmarket: string;
}

interface Combo {
  id: string;
  status: string;
  uses: ComboCardUse[];
  requires: ComboReference[];
  produces: ComboFeatureProduced[];
  of: ComboReference[];
  includes: ComboReference[];
  identity: string;
  manaNeeded: string;
  manaValueNeeded: number;
  easyPrerequisites: string;
  notablePrerequisites: string;
  description: string;
  notes: string;
  popularity: number;
  spoiler: boolean;
  bracketTag: string;
  legalities: ComboLegalities;
  prices: ComboPrices;
  variantCount: number;
}

interface PageProps {
  combos: Combo[];
  featured: boolean;
  count: number;
  page: string;
}

interface RootObject {
  cookies: string;
  __N_SSP: boolean;
  pageProps: PageProps;
}

// Define the tool for the LLM (Gemini format)
export const comboSearchTool: Tool = {
  functionDeclarations: [
    {
      name: "searchCombos",
      description:
        "Search for Magic: The Gathering card combos from Commander Spellbook. Returns a list of combos matching the search query.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          query: {
            type: SchemaType.STRING,
            description: "Search query to find card combos",
          },
        },
        required: ["query"],
      },
    },
  ],
};

// Function to search for combos
export async function searchCombos(query: string): Promise<Combo[]> {
  try {
    const response = await fetch(
      `https://commanderspellbook.com/_next/data/KkcMorcjctE2dYiMai3VD/search.json?q=${encodeURIComponent(
        query
      )}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: RootObject = await response.json();
    return data.pageProps.combos;
  } catch (error) {
    console.error("Error searching combos:", error);
    throw error;
  }
}
