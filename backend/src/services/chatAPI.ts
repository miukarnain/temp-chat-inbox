import { getInitialMessages } from "../controllers/chatControllers";
import {
  CreateChannelRequest,
  SendMessageRequest,
  UserChannel,
  TokenResponse,
  ChannelInfo,
  Message,
  CreateChannelResponse,
  SendMessageResponse,
  UserChannelsResponse,
  GetInitialMessagesResponse,
  GetMockUsersResponse,
  GetMessageHistoryRequest,
  MessageHistoryResponse,
} from "../types/chat";

const API_BASE = `http://localhost:${process.env.PORT}/api/chat`;

export const chatAPI = {
  // Get Ably token - use TokenResponse as return type
  getToken: async (): Promise<TokenResponse> => {
    const response = await fetch(`${API_BASE}/token`);
    if (!response.ok) {
      throw new Error("Failed to get token");
    }
    const data = (await response.json()) as TokenResponse;
    return data;
  },

  // Create channel
  createChannel: async (
    data: CreateChannelRequest
  ): Promise<CreateChannelResponse> => {
    const response = await fetch(`${API_BASE}/channel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Failed to create channel");
    }
    const responseData = (await response.json()) as CreateChannelResponse;
    return responseData;
  },

  // Send message
  sendMessage: async (
    data: SendMessageRequest
  ): Promise<SendMessageResponse> => {
    const response = await fetch(`${API_BASE}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }
    const responseData = (await response.json()) as SendMessageResponse;
    return responseData;
  },

  // Get user channels
  getUserChannels: async (userId: string): Promise<UserChannelsResponse> => {
    const response = await fetch(`${API_BASE}/channels/${userId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch user channels");
    }
    const responseData = (await response.json()) as UserChannelsResponse;
    return responseData;
  },

  // Get initial messages
  getInitialMessages: async (
    userId: string
  ): Promise<GetInitialMessagesResponse> => {
    console.log("---------backend ")
    const response = await fetch(`${API_BASE}/initial-messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error("Failed to get initial messages");
    }

    const responseData = (await response.json()) as GetInitialMessagesResponse;
    return responseData;
  },

  // Get mock users
  getMockUsers: async (): Promise<GetMockUsersResponse> => {
    const response = await fetch(`${API_BASE}/mock-users`);
    
    if (!response.ok) {
      throw new Error('Failed to get mock users');
    }
    
    const responseData = await response.json() as GetMockUsersResponse;
    return responseData;
  },

   // Get message history
   getMessageHistory: async (
    data: GetMessageHistoryRequest
  ): Promise<MessageHistoryResponse> => {
    const response = await fetch(`${API_BASE}/message-history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to get message history");
    }

    const responseData = (await response.json()) as MessageHistoryResponse;
    return responseData;
  },
};
