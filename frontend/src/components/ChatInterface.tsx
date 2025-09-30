"use client";

import React, { useState, useRef, useEffect } from "react";
import { Message, Chat as ChatType } from "@/types/chat";
import MessageBubble from "./MessageBubble";
import { Send, Bot, Loader2 } from "lucide-react";
import { mockProvider, mockAppointmentSlots } from "@/data/mockData";
import { chatAPI } from "@/services/chatAPI";

interface ChatInterfaceProps {
  chat: ChatType;
  onSendMessage: (content: string) => void;
  onLoadMoreMessages: (messages: Message[]) => void;
  currentUserName: string;
  channelName?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  chat,
  onSendMessage,
  onLoadMoreMessages,
  currentUserName,
  channelName,
}) => {
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages]);

  const loadMessageHistory = async () => {
    if (!channelName || isLoadingHistory) return;

    setIsLoadingHistory(true);
    try {
      const response = await chatAPI.getMessageHistory({
        channelName,
        limit: 50,
        direction: 'backwards'
      });

      if (response.success && response.messages.length > 0) {
        // Convert timestamp strings to Date objects
        const messagesWithDates = response.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        
        onLoadMoreMessages(messagesWithDates);
        setHasMoreMessages(response.hasMore);
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error('Failed to load message history:', error);
      setHasMoreMessages(false);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    // Load more messages when scrolled to top and there are more to load
    if (container.scrollTop === 0 && hasMoreMessages && !isLoadingHistory) {
      loadMessageHistory();
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim() || isSending) return;

    const messageContent = inputMessage.trim();
    setInputMessage("");
    setIsSending(true);

    try {
      onSendMessage(messageContent);

      // if (channelName) {
      //   await chatAPI.sendMessage({
      //     channelName: channelName,
      //     senderId: currentUserName,
      //     senderName: currentUserName,
      //     content: messageContent,
      //     messageType: "text",
      //   });
      // }
    } catch (error) {
      console.error("Failed to send message to backend:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickReply = async (reply: string) => {
    if (isSending) return;

    setIsSending(true);

    try {
      onSendMessage(reply);

      if (channelName) {
        await chatAPI.sendMessage({
          channelName: channelName,
          senderId: currentUserName,
          senderName: currentUserName,
          content: reply,
          messageType: "text",
        });
      }
    } catch (error) {
      console.error("Failed to send quick reply to backend:", error);
    } finally {
      setIsSending(false);
    }
  };

  const getSuggestedReplies = () => {
    const lastMessage = chat.messages[chat.messages.length - 1];

    if (lastMessage?.senderId === "bot") {
      if (lastMessage.options && lastMessage.options.length > 0) {
        return lastMessage.options;
      }

      switch (chat.currentStep) {
        case "initial":
          return [
            "Less than 6 months",
            "More than 6 months",
            "I'm just getting started",
          ];
        case "provider":
          return ["Yes Please"];
        case "booking":
          return mockAppointmentSlots.map((slot) => slot.formattedDate);
        default:
          return [];
      }
    }

    return [];
  };

  const suggestedReplies = getSuggestedReplies();

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div className="ml-3">
            <h2 className="font-semibold text-gray-900">{currentUserName}</h2>
            <p className="text-sm text-gray-500">
              {currentUserName ? "Online" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-4"
      >
        <div className="max-w-3xl mx-auto">
          {/* Load more indicator */}
          {isLoadingHistory && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          )}

          {chat.messages.map((message, index) => (
            <MessageBubble
              key={`${message.id}-${index}`}
              message={message}
              sender={currentUserName}
            />
          ))}

          {/* Suggested Replies */}
          {suggestedReplies.length > 0 && (
            <div className="flex justify-start mb-4">
              <div className="max-w-[85%]">
                <div className="flex flex-wrap gap-2">
                  {suggestedReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      disabled={isSending}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <form
          onSubmit={handleSendMessage}
          className="max-w-3xl mx-auto flex space-x-4"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isSending}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-black"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isSending}
            className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;