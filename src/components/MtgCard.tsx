import React from "react";
import ManaSymbols from "@/components/ManaSymbols";
import { Card } from "@/types/SqliteCard.type";

interface MtgCardProps {
  card: Card;
}

const MtgCard: React.FC<MtgCardProps> = ({ card }) => {
  // Construct the Scryfall image URL using set code and number
  const imageUrl = card.setCode && card.number
    ? `https://api.scryfall.com/cards/${card.setCode.toLowerCase()}/${card.number}?format=image`
    : null;

  return (
    <div className=" w-64 flex flex-col">
      {imageUrl ? (
        <img src={imageUrl} alt={card.name} className="w-full rounded-[12px] border border-[#5A4A3A] shadow-md" />
      ) : (
        <div className="p-4 border border-[#5A4A3A] rounded-[16px] shadow-md bg-[#3D3D3D] text-[#EEEEEE]">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-[#EEEEEE]">{card.name}</h2>
            {card.manaCost && <ManaSymbols manaCost={card.manaCost} />}
          </div>
          <p className="text-sm text-[#EEEEEE] mb-2">{card.type}</p>
          {card.text && (
            <p className="text-sm italic text-[#CCCCCC] mb-2 whitespace-pre-line">
              {card.text}
            </p>
          )}
          {(card.power ||
            card.toughness ||
            card.setCode ||
            card.number ||
            card.rarity) && (
            <div className="mt-auto pt-2 border-t border-[#5A4A3A] text-sm flex justify-between items-center text-[#CCCCCC]">
              <div>
                {card.setCode && <span className="mr-2">{card.setCode}</span>}
                {card.number && <span className="font-mono">#{card.number}</span>}
              </div>
              <div>
                {card.rarity && (
                  <span className="mr-2 capitalize">{card.rarity}</span>
                )}
                {card.power && card.toughness
                  ? `${card.power}/${card.toughness}`
                  : card.power || card.toughness}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MtgCard;
