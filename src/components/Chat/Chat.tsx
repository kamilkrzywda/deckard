import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card } from "@/generated/prisma";

// Add custom animation class
const styles = `
  @keyframes higherBounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  .animate-higher-bounce {
    animation: higherBounce 1s infinite;
  }
`;

interface Message {
  text: string;
  sender: "user" | "assistant";
  suggestions?: string[];
  cardsToDisplay?: Card[];
  cardNumbers?: { [key: string]: string };
  isLoading?: boolean;
}

export const Chat = ({
  input,
  setInput,
  messages,
  handleSend,
  handleKeyPress,
  handleSuggestionClick,
  messagesEndRef,
}: {
  input: string;
  setInput: (input: string) => void;
  messages: Message[];
  handleSend: () => void;
  handleKeyPress: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSuggestionClick: (suggestion: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}) => {
  return (
    <div className="w-2xl bg-[#2C2C2C] p-4 flex flex-col flex-shrink-0 text-[#EEEEEE] h-full max-h-screen">
      <style>{styles}</style>
      <h2 className="text-xl font-bold mb-4">Deck Builder Chat</h2>
      <div className="flex flex-col flex-grow max-h-[calc(100%-3rem)] max-w-[100%]">
        <div className="mb-4 flex flex-col flex-grow overflow-y-auto">
          {messages.map((message, index) => {
            if (message.isLoading) {
              return (
                <div key={index} className="p-4 rounded-lg mb-2 bg-[#3D3D3D] text-[#EEEEEE] self-start">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#EEEEEE] rounded-full animate-higher-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-[#EEEEEE] rounded-full animate-higher-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-[#EEEEEE] rounded-full animate-higher-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              );
            }

            const parts = message.text.split(
              /<thinking>|<\/thinking>|<think>|<\/think>/
            );
            const isThinking =
              (message.text.includes("<thinking>") &&
                message.text.includes("</thinking>")) ||
              (message.text.includes("<think>") &&
                message.text.includes("</think>"));

            return (
              <div
                key={index}
                className={`p-2 rounded-lg mb-2 ${
                  message.sender === "user"
                    ? "bg-[#5A4A3A] text-[#EEEEEE] self-end"
                    : "bg-[#3D3D3D] text-[#EEEEEE] self-start"
                }`}
              >
                {parts.map((part, i) => {
                  // Check if the current part is within thinking tags
                  const isThinkingPart = isThinking && i % 2 !== 0;
                  return (
                    <div
                      key={i}
                      className={
                        isThinkingPart ? "bg-[#4A4A4A] p-2 rounded-md my-1" : ""
                      }
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {part}
                      </ReactMarkdown>
                    </div>
                  );
                })}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {message.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="bg-[#5A4A3A] hover:bg-[#7a6a5a] text-[#EEEEEE] text-sm py-1 px-3 rounded-lg transition duration-150 ease-in-out cursor-pointer"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex items-center mt-auto">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-grow p-2 rounded-lg border border-[#5A4A3A] bg-[#3D3D3D] text-[#EEEEEE] placeholder-[#CCCCCC] mr-2"
          />
          <button
            onClick={handleSend}
            className="bg-[#5A4A3A] hover:bg-[#7a6a5a] text-[#EEEEEE] font-semibold py-2 px-4 rounded-xl shadow-md flex-shrink-0 transition duration-150 ease-in-out cursor-pointer"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
