import React from "react";

interface ManaSymbolsProps {
  manaCost: string;
}

const manaSymbolMap: { [key: string]: string } = {
  W: "⚪", // White
  U: "🔵", // Blue
  B: "⚫", // Black
  R: "🔴", // Red
  G: "🟢", // Green
  C: " colorless", // Colorless
  X: "X", // X
  S: "❄️", // Snow
  T: "tap", // Tap
  Q: "untap", // Untap
  "0": "⓪",
  "1": "①",
  "2": "②",
  "3": "③",
  "4": "④",
  "5": "⑤",
  "6": "⑥",
  "7": "⑦",
  "8": "⑧",
  "9": "⑨",
  "10": "⑩",
  "11": "⑪",
  "12": "⑫",
  "13": "⑬",
  "14": "⑭",
  "15": "⑮",
  "16": "⑯",
};

const ManaSymbols: React.FC<ManaSymbolsProps> = ({ manaCost }) => {
  if (!manaCost) {
    return null;
  }

  // Basic parsing: split by curly braces and map symbols
  const symbols = manaCost
    .replace(/\{|\}/g, "")
    .split("")
    .map((symbol) => manaSymbolMap[symbol] || symbol);

  return (
    <span className="inline-flex items-center">
      {symbols.map((symbol, index) => (
        <span key={index} className="mx-[1px]">
          {symbol}
        </span>
      ))}
    </span>
  );
};

export default ManaSymbols;
