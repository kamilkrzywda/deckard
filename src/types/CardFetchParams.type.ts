import { Card } from "./SqliteCard.type";

export interface CardFetchParams {
  filter?: {
    [key in keyof Card]?: string | number | boolean;
  };
  order?: string;
  limit?: number;
  offset?: number;
}