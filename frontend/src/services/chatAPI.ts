import { 
  CreateChannelRequest, 
  SendMessageRequest, 
  UserChannel,
  TokenResponse,
  CreateChannelResponse,
  SendMessageResponse,
  UserChannelsResponse,
  GetInitialMessagesResponse,
  GetMockUsersResponse,
  GetMessageHistoryRequest,
  MessageHistoryResponse
} from '@/types/chat';

// const API_BASE = `http://localhost:${process.env.PORT}/api/chat`;

const API_BASE = `http://localhost:4001/api/chat`;
// console.log("API_BASE", API_BASE);
export const chatAPI = {
  // Get Ably token
  getToken: async (): Promise<TokenResponse> => {
    const response = await fetch(`${API_BASE}/token`);
    if (!response.ok) {
      throw new Error('Failed to get token');
    }
    return await response.json() as TokenResponse;
  },

  // Create channel
  createChannel: async (data: CreateChannelRequest): Promise<CreateChannelResponse> => {
    const response = await fetch(`${API_BASE}/channel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error('Failed to create channel');
    }
    return await response.json() as CreateChannelResponse;
  },

  // Send message
  sendMessage: async (data: SendMessageRequest): Promise<SendMessageResponse> => {
    const response = await fetch(`${API_BASE}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    console.log("----------response",response); 
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
    return await response.json() as SendMessageResponse;
  },

  // Get user channels
  getUserChannels: async (userId: string): Promise<UserChannelsResponse> => {
    const response = await fetch(`${API_BASE}/channels/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user channels');
    }
    return await response.json() as UserChannelsResponse;
  },

  // Get initial messages
  getInitialMessages: async (
    userId: string
  ): Promise<GetInitialMessagesResponse> => {
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
    // console.log("getMockUserset", API_BASE);
    const response = await fetch(`${API_BASE}/mock-users`);
    
    if (!response.ok) {
      throw new Error('Failed to get mock users');
    }
    
    const responseData = await response.json() as GetMockUsersResponse;
    return responseData;
  },

  // Get message history
  getMessageHistory: async (data: GetMessageHistoryRequest): Promise<MessageHistoryResponse> => {
    const response = await fetch(`${API_BASE}/message-history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to get message history');
    }

    return await response.json() as MessageHistoryResponse;
  },
};