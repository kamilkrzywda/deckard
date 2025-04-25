import { useState, useRef, useEffect } from "react";
import { Card } from "@/types/SqliteCard.type";

// Client-side message structure for display
interface DisplayMessage {
  text: string;
  sender: "user" | "assistant";
  suggestions?: string[];
  cardsToDisplay?: Card[];
  isLoading?: boolean;
}

// Type for the API response structure (no chatId anymore)
interface ApiResponse {
  response: {
    message: string;
    cardsToDisplay?: Card[];
    suggestions?: string[];
  };
  error?: string;
}

export const useChat = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [loading, setLoading] = useState(false);
  // Removed chatId state
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Scroll to bottom only if the user isn't scrolled up
    const ref = messagesEndRef.current;
    if (ref) {
      const scrollThreshold = 100; // Pixels from bottom
      const isScrolledToBottom =
        ref.scrollHeight - ref.clientHeight <= ref.scrollTop + scrollThreshold;
      if (isScrolledToBottom) {
        scrollToBottom();
      }
    }
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (loading) return;
    if (!messageText.trim()) return;

    setLoading(true);

    const userDisplayMessage: DisplayMessage = {
      text: messageText,
      sender: "user",
    };

    // Prepare the history to send to the backend
    const messagesToSend: DisplayMessage[] = [...messages, userDisplayMessage];

    // Add loading message
    const messagesWithLoading: DisplayMessage[] = [
      ...messagesToSend,
      { text: "", sender: "assistant", isLoading: true },
    ];

    // Map DisplayMessage[] to the backend's expected FrontendMessage[] structure
    // This is the format expected by /api/chat/route.ts
    const frontendMessages = messagesToSend.map((msg) => ({
      role: msg.sender, // 'user' or 'assistant'
      content: msg.text, // Just the text content
    }));

    // Update UI immediately with the user's message and loading indicator
    setMessages(messagesWithLoading);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: frontendMessages }), // Send the mapped structure
      });

      // Store the current scroll position before updating messages
      const scrollRef = messagesEndRef.current;
      const previousScrollHeight = scrollRef?.scrollHeight ?? 0;
      const previousScrollTop = scrollRef?.scrollTop ?? 0;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Revert optimistic UI update on error
        setMessages((prev) => prev.slice(0, -1));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data: ApiResponse = await response.json();

      if (data.error) {
        // Revert optimistic UI update on error
        setMessages((prev) => prev.slice(0, -1));
        throw new Error(data.error);
      }

      // Removed chatId handling

      if (data.response) {
        const assistantMessage: DisplayMessage = {
          text: data.response.message || "",
          sender: "assistant",
          suggestions: data.response.suggestions || [],
          cardsToDisplay: data.response.cardsToDisplay || [],
        };
        // Replace the loading message with the actual response
        setMessages((prev) => [...prev.slice(0, -1), assistantMessage]);

        // Attempt to maintain scroll position if user wasn't at the bottom
        // Wait for the next frame to allow DOM update
        requestAnimationFrame(() => {
          if (scrollRef) {
            const scrollThreshold = 100;
            const wasScrolledToBottom =
              previousScrollHeight - scrollRef.clientHeight <=
              previousScrollTop + scrollThreshold;
            if (!wasScrolledToBottom) {
              // Restore previous scroll position
              scrollRef.scrollTop =
                previousScrollTop +
                (scrollRef.scrollHeight - previousScrollHeight);
            } else {
              // Scroll to bottom if user was already there
              scrollToBottom();
            }
          }
        });
      } else {
        console.error("API response structure missing 'response' field:", data);
        // Revert optimistic UI update on error
        setMessages((prev) => prev.slice(0, -1));
        // Add error message instead
        setMessages((prev) => [
          ...prev,
          {
            text: "Error: Received unexpected response format from server.",
            sender: "assistant",
          },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      // Make sure the user message is still present before adding the error
      setMessages((prev) => {
        // Find the index of the message we tried to send
        const userMsgIndex = prev.findIndex(
          (m) => m.sender === "user" && m.text === messageText
        );
        const historyToShow =
          userMsgIndex !== -1 ? prev.slice(0, userMsgIndex + 1) : prev;
        return [
          ...historyToShow,
          {
            text: `Sorry, there was an error: ${errorMessage}`,
            sender: "assistant",
          },
        ];
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    const messageText = input.trim();
    setInput("");
    sendMessage(messageText);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return {
    input,
    setInput,
    messages,
    loading,
    handleSend,
    handleKeyPress,
    messagesEndRef,
    handleSuggestionClick,
  };
};
