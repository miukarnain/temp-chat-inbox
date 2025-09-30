'use client';

import React from 'react';
import { User } from '@/types/chat';
import { MessageCircle, Search } from 'lucide-react';

interface ChatSidebarProps {
  users: User[];
  currentUserName: string;
  onUserSelect: (userId: string) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ users, currentUserName, onUserSelect }) => {
  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => onUserSelect(user.name)}
            className={`w-full px-6 py-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
              currentUserName === user.name ? 'bg-blue-50 border-blue-200' : ''
            }`}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                  {user.unreadCount && user.unreadCount > 0 ? (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {user.unreadCount}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">{user.lastMessageTime}</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate mt-1">{user.lastMessage}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;