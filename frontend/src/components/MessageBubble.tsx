import React from 'react';
import { Message } from '@/types/chat';
import { mockProvider, mockAppointmentSlots } from '@/data/mockData';
import ProviderCard from './ProviderCard';

interface MessageBubbleProps {
  message: Message;
  sender?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, sender }) => {

  const isBot = sender;

  // Helper function to safely format timestamp
  const formatTimestamp = (timestamp: Date | string): string => {
    if (timestamp instanceof Date) {
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If it's a string, convert to Date first
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Invalid timestamp:', timestamp);
      return '';
    }
  };

  if (message.messageType === 'provider') {
    return (
      <div className="flex justify-start mb-4">
        <div className="max-w-[85%]">
          <ProviderCard provider={mockProvider} />
          <span className="text-xs text-gray-500 mt-1 block text-left">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
      </div>
    );
  }

  if (message.messageType === 'option' && message.options) {
    console.log("----------options", message.content); 
    return (
      <div className="flex justify-start mb-4">
        <div className="max-w-[85%]">
          <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
            <div className="whitespace-pre-line text-gray-800 mb-3">{message.content}</div>
            <div className="space-y-2">
              {message.options.map((option, index) => (
                <button
                  key={index}
                  className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 font-medium transition-colors border border-gray-200"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <span className="text-xs text-gray-500 mt-1 block text-left">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`max-w-[85%] ${isBot ? '' : 'text-right'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isBot
              ? 'bg-white border border-gray-200 shadow-sm'
              : 'bg-blue-500 text-white'
          }`}
        >
          <div className={`whitespace-pre-line ${isBot ? 'text-black' : 'text-white'}`}>
            {message.content}
          </div>
        </div>
        <span
          className={`text-xs text-gray-500 mt-1 block ${
            isBot ? 'text-left' : 'text-right'
          }`}
        >
          {formatTimestamp(message.timestamp)}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;