import { Card } from "./SqliteCard.type";

export interface Suggestion {
  text: string;
  action: string;
}

export interface LLMResponse {
  message: string;
  cardsToDisplay: Card[];
  suggestions: Suggestion[];
}
