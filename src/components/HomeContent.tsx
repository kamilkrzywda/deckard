"use client";

import React from "react";
import CardList from "@/components/CardList";
import { Chat } from "@/components/Chat";
import { useChat } from "./Chat/useChat";

export default function HomeContent() {
  const {
    input,
    setInput,
    messages,
    handleSend,
    handleKeyPress,
    messagesEndRef,
    handleSuggestionClick,
  } = useChat();

  return (
    <div className="flex h-screen">
      <Chat
        input={input}
        setInput={setInput}
        messages={messages}
        handleSend={handleSend}
        handleKeyPress={handleKeyPress}
        messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
        handleSuggestionClick={handleSuggestionClick}
      />
      <main className="flex flex-col gap-6 row-start-2 items-center sm:items-start">
        <CardList
          cards={[
            ...new Map(
              messages
                .map((message) => message.cardsToDisplay || [])
                .flat()
                .map((card) => [card.name, card])
            ).values(),
          ]}
          lastMessageCards={[
            ...new Map(
              messages[messages.length - 1]?.cardsToDisplay?.map((card) => [
                card.name,
                card,
              ]) || []
            ).values(),
          ]}
        />
      </main>
    </div>
  );
}
