export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  messageType: 'text' | 'option' | 'system';
  timestamp: string;
  read: boolean;
  options?: string[];
}

export interface ChannelInfo {
  channelName: string;
  userId: string;
  recipientName: string;
  recipientId?: string;
  createdAt: Date;
  messages: Message[];
}

export interface CreateChannelRequest {
  userId: string;
  recipientName: string;
  recipientId?: string;
}

export interface SendMessageRequest {
  channelName: string;
  senderId: string;
  senderName: string;
  content: string;
  messageType?: 'text' | 'option' | 'system';
  options?: string[];
}

export interface UserChannel {
  channelName: string;
  recipientName: string;
  recipientId?: string;
  lastMessage: Message | null;
  unreadCount: number;
  createdAt: Date;
}

export interface TokenResponse {
  keyName: string;
  clientId?: string;
  timestamp: number;
  capability: string;
  nonce: string;
  mac: string;
  ttl?: number;
}

export interface CreateChannelResponse {
  channelName: string;
  message: string;
  channelInfo: ChannelInfo;
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  messageData: Message;
}

export interface UserChannelsResponse {
  channels: UserChannel[];
}

export interface Chat {
  id: string;
  recipient: {
    id: string;
    name: string;
  };
  messages: Message[];
  currentStep: 'initial' | 'provider' | 'booking' | 'confirmed';
  channelName?: string;
}

export interface User {
  id: string;
  name: string;
  lastMessage?: string;
  timestamp?: string;
  unread?: boolean;
  unreadCount?: number; 
  lastMessageTime?: string;
}

export type AblyTokenRequest = TokenResponse;

export interface GetInitialMessagesRequest {
  userId: string;
}

export interface GetInitialMessagesResponse {
  chat: Chat;
  success: boolean;
}

export interface MockUser {
  id: string;
  name: string;
  lastMessage?: string;
  timestamp?: string;
  unread?: boolean;
  unreadCount?: number;
  lastMessageTime?: string;
}

export interface GetMockUsersResponse {
  users: MockUser[];
  success: boolean;
}

export interface GetMessageHistoryRequest {
  channelName: string;
  limit?: number;
  direction?: 'forwards' | 'backwards';
}

export interface MessageHistoryResponse {
  success: boolean;
  messages: Message[];
  hasMore: boolean;
}