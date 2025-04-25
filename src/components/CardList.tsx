"use client";

import React, { useState, useMemo } from "react";
import MtgCard from "@/components/MtgCard";
import { Card } from "@/types/SqliteCard.type";

interface CardListProps {
  cards: Card[];
  lastMessageCards: Card[];
}

type GroupCriteria = keyof Card | null;
type OrderCriteria = { field: keyof Card; direction: "ASC" | "DESC" } | null;

const CardList: React.FC<CardListProps> = ({ cards, lastMessageCards }) => {
  const [groupCriteria, setGroupCriteria] = useState<GroupCriteria>(null);
  const [orderCriteria, setOrderCriteria] = useState<OrderCriteria>({
    field: "name",
    direction: "ASC",
  });
  const [rolledUpGroups, setRolledUpGroups] = useState<Set<string>>(new Set());
  const [useLastMessageCards, setUseLastMessageCards] = useState(false);

  const toggleRollUp = (groupName: string | null) => {
    const key = groupName || "Uncategorized";
    setRolledUpGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const groupedAndOrderedCards = useMemo(() => {
    const currentCards = useLastMessageCards ? cards : lastMessageCards;

    // Ordering logic
    if (orderCriteria) {
      currentCards.sort((a, b) => {
        const fieldA = a[orderCriteria.field];
        const fieldB = b[orderCriteria.field];

        if (fieldA === null || fieldA === undefined)
          return orderCriteria.direction === "ASC" ? 1 : -1;
        if (fieldB === null || fieldB === undefined)
          return orderCriteria.direction === "ASC" ? -1 : 1;

        if (typeof fieldA === "string" && typeof fieldB === "string") {
          return orderCriteria.direction === "ASC"
            ? fieldA.localeCompare(fieldB)
            : fieldB.localeCompare(fieldA);
        }

        if (fieldA < fieldB) {
          return orderCriteria.direction === "ASC" ? -1 : 1;
        }
        if (fieldA > fieldB) {
          return orderCriteria.direction === "ASC" ? 1 : -1;
        }
        return 0;
      });
    }

    // Grouping logic
    if (groupCriteria) {
      const groups: Record<string, Card[]> = {};
      currentCards.forEach((card) => {
        const groupValue = card[groupCriteria]?.toString() || "Uncategorized";
        if (!groups[groupValue]) {
          groups[groupValue] = [];
        }
        groups[groupValue].push(card);
      });
      return Object.entries(groups).map(([groupName, groupCards]) => ({
        groupName,
        cards: groupCards,
      }));
    } else {
      return [{ groupName: null, cards: currentCards }];
    }
  }, [
    cards,
    lastMessageCards,
    groupCriteria,
    orderCriteria,
    useLastMessageCards,
  ]);

  // TODO: Add UI controls for grouping and ordering

  return (
    <div className="flex-grow overflow-y-auto flex flex-col gap-4 p-4">
      <div className="flex gap-4 p-4 bg-[#2C2C2C] rounded-md items-center sticky top-0 z-10">
        <div>
          <label htmlFor="groupBy" className="text-[#EEEEEE] mr-2">
            Group By:
          </label>{" "}
          <select
            id="groupBy"
            value={groupCriteria || ""}
            onChange={(e) =>
              setGroupCriteria((e.target.value as keyof Card) || null)
            }
            className="bg-[#3D3D3D] text-[#EEEEEE] p-2 rounded-md border border-[#5A4A3A] focus:outline-none focus:border-[#FFA726]"
          >
            <option value="">None</option>
            <option value="types">Type</option>
            <option value="colorIdentity">Color Identity</option>
            <option value="manaValue">Mana Value</option>
            <option value="rarity">Rarity</option>
            <option value="subtypes">Subtypes</option>
            <option value="number">Card Number</option>
          </select>
        </div>
        <div>
          <label htmlFor="orderBy" className="text-[#EEEEEE] mr-2">
            Order By:
          </label>{" "}
          {/* Styled label */}
          <select
            id="orderBy"
            value={
              orderCriteria
                ? `${String(orderCriteria.field)}:${orderCriteria.direction}`
                : ""
            }
            onChange={(e) => {
              const [field, direction] = e.target.value.split(":");
              setOrderCriteria({
                field: field as keyof Card,
                direction: direction as "ASC" | "DESC",
              });
            }}
            className="bg-[#3D3D3D] text-[#EEEEEE] p-2 rounded-md border border-[#5A4A3A] focus:outline-none focus:border-[#FFA726]"
          >
            <option value="name:ASC">Name (A-Z)</option>
            <option value="name:DESC">Name (Z-A)</option>
            <option value="manaValue:ASC">Mana Value (Low-High)</option>
            <option value="manaValue:DESC">Mana Value (High-Low)</option>
            <option value="power:ASC">Power (Low-High)</option>
            <option value="power:DESC">Power (High-Low)</option>
            <option value="toughness:ASC">Toughness (Low-High)</option>
            <option value="toughness:DESC">Toughness (High-Low)</option>
            <option value="number:ASC">Card Number (Low-High)</option>
            <option value="number:DESC">Card Number (High-Low)</option>
          </select>
        </div>
        <div>
          <label htmlFor="useLastMessageCards" className="text-[#EEEEEE] mr-2">
            Show all cards:
          </label>
          <input
            type="checkbox"
            id="useLastMessageCards"
            checked={useLastMessageCards}
            onChange={(e) => setUseLastMessageCards(e.target.checked)}
            className="bg-[#3D3D3D] text-[#EEEEEE] p-2 rounded-md border border-[#5A4A3A] focus:outline-none focus:border-[#FFA726]"
          />
        </div>
      </div>
      {groupedAndOrderedCards.map(({ groupName, cards: groupCards }) => (
        <div key={groupName || "no-group"}>
          {groupName && (
            <h3
              className="text-[#EEEEEE] text-lg font-bold mt-4 mb-2 cursor-pointer flex items-center" // Added cursor-pointer and flex items-center
              onClick={() => toggleRollUp(groupName)}
            >
              {groupName} ({groupCards.length})
              <span
                className={`ml-2 transform transition-transform ${
                  rolledUpGroups.has(groupName || "Uncategorized")
                    ? "rotate-0"
                    : "rotate-90"
                }`}
              >
                &#9660;
              </span>
            </h3>
          )}
          {!rolledUpGroups.has(groupName || "Uncategorized") && ( // Conditional rendering, use 'Uncategorized' for null group names
            <div className="flex flex-wrap gap-2 justify-center">
              {groupCards.map((card) => (
                <MtgCard 
                  key={card.uuid} 
                  card={card}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CardList;
