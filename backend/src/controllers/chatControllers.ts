import { Request, Response } from 'express';
import Ably from 'ably';
import { v4 as uuidv4 } from 'uuid';
import {
  ChannelInfo,
  CreateChannelRequest,
  SendMessageRequest,
  UserChannel,
  Message,
  GetInitialMessagesRequest,
  MessageHistoryResponse,
  GetMessageHistoryRequest
} from '../types/chat';
import { getInitialMessagesfromMockData, getMockUsersFromMockData } from '../data/mockData'

// Initialize Ably with proper options
const ably = new Ably.Rest({
  key: process.env.ABLY_API_KEY || ''
});

// Store active channels (in production, use Redis or database)
const activeChannels = new Map<string, ChannelInfo>();

// Generate unique channel name in format: userId_userName_toothsome
const generateChannelName = (userId: string, userName: string): string => {
  const sanitizedUserId = userId.toLowerCase().replace(/[^a-z0-9]/g, '');
  const sanitizedUserName = userName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  return `${process.env.CHANNEL_NAME_SPACE}${sanitizedUserId}_${sanitizedUserName}_toothsomeChatBot `;
};



export const getAblyToken = async (req: Request, res: Response): Promise<void> => {
  try {
    // Let Ably handle the token creation with minimal params
    const tokenRequest = await ably.auth.createTokenRequest({
      ttl: 3600000
    });
    
    res.json(tokenRequest);
  } catch (error) {
    console.error('Error generating Ably token:', error);
    res.status(500).json({ error: 'Error generating token' });
  }
};

// In your chatControllers.ts - update the createChannel function
export const createChannel = async (req: Request<{}, {}, CreateChannelRequest>, res: Response): Promise<void> => {
  try {
    const { userId, recipientName } = req.body;
    
    if (!userId || !recipientName) {
      res.status(400).json({ error: 'userId and recipientName are required' });
      return;
    }

    const channelName = generateChannelName(userId, recipientName);
    console.log("Channel name:", channelName);
    console.log("User ID:", userId);
    console.log("User Name:", recipientName);
    
    // Check if channel already exists for this user (case-insensitive)
    const existingChannel = Array.from(activeChannels.values()).find(
      channel => channel.channelName.toLowerCase() === channelName.toLowerCase()
    );

    if (existingChannel) {
      console.log("Using existing channel:", existingChannel.channelName);
      res.status(200).json({
        channelName: existingChannel.channelName,
        message: 'Channel already exists',
        channelInfo: existingChannel
      });
      return;
    }

    // Store channel info
    const channelInfo: ChannelInfo = {
      channelName,
      userId,
      recipientName,
      createdAt: new Date(),
      messages: []
    };

    activeChannels.set(channelName, channelInfo);
    console.log("Channel created and stored:", channelName);
    console.log("Active channels:", Array.from(activeChannels.keys()));

    res.status(201).json({
      channelName,
      message: 'Channel created successfully',
      channelInfo
    });
  } catch (error) {
    console.error('Error creating channel:', error);
    res.status(500).json({ error: 'Failed to create channel' });
  }
};

// Also update the sendMessage function to be more robust
export const sendMessage = async (req: Request<{}, {}, SendMessageRequest>, res: Response): Promise<void> => {
  try {
    const { channelName, senderId, senderName, content, messageType = 'text', options } = req.body;

    if (!channelName || !senderId || !content) {
      res.status(400).json({ error: 'channelName, senderId, and content are required' });
      return;
    }

    console.log("Looking for channel:", channelName);
    console.log("Available channels:", Array.from(activeChannels.keys()));

    // Get or create channel - if not found, create it
    let channelInfo = activeChannels.get(channelName);
    
    if (!channelInfo) {
      console.log("Channel not found in active channels, creating now...");
      // Extract userId and recipientName from channelName
      const parts = channelName.split('_');
      if (parts.length >= 2) {
        const userId = parts[0];
        const recipientName = parts[1];
        
        // Create channel info
        channelInfo = {
          channelName,
          userId,
          recipientName,
          createdAt: new Date(),
          messages: []
        };
        
        activeChannels.set(channelName, channelInfo);
        console.log("Auto-created channel:", channelName);
      } else {
        res.status(404).json({ error: 'Channel not found and cannot be auto-created' });
        return;
      }
    }

    const message: Message = {
      id: uuidv4(),
      senderId,
      senderName,
      content,
      messageType,
      timestamp: new Date().toISOString(),
      read: false,
      options
    };

    // Add message to channel history
    channelInfo.messages.push(message);
    activeChannels.set(channelName, channelInfo);

    // Publish message via Ably
    const channel = ably.channels.get(channelName);
    await channel.publish('message', message);

    res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      messageData: message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const getUserChannels = async (req: Request<{ userId: string }>, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    const userChannels: UserChannel[] = Array.from(activeChannels.values())
      .filter((channel: ChannelInfo) => channel.userId === userId)
      .map((channel: ChannelInfo) => ({
        channelName: channel.channelName,
        recipientName: channel.recipientName,
        recipientId: channel.recipientId,
        lastMessage: channel.messages[channel.messages.length - 1] || null,
        unreadCount: channel.messages.filter((msg: Message) => !msg.read && msg.senderId !== userId).length,
        createdAt: channel.createdAt
      }));

    res.status(200).json({ channels: userChannels });
  } catch (error) {
    console.error('Error fetching user channels:', error);
    res.status(500).json({ error: 'Failed to fetch user channels' });
  }
};

export const getInitialMessages = async (req: Request<{}, {}, GetInitialMessagesRequest>, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({ error: 'userId is required' });
      return;
    }

    // Get initial messages from your mock data
    const chat = getInitialMessagesfromMockData(userId);

    res.status(200).json({
      success: true,
      chat
    });
  } catch (error) {
    console.error('Error fetching initial messages:', error);
    res.status(500).json({ error: 'Failed to fetch initial messages' });
  }
};

export const getMockUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get mock users from your mock data
    const users = getMockUsersFromMockData;

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching mock users:', error);
    res.status(500).json({ error: 'Failed to fetch mock users' });
  }
};

// Create a REST client instance (you might want to reuse this)
const ablyRest = new Ably.Rest({ key: process.env.ABLY_API_KEY });

export const getMessageHistory = async (req: Request, res: Response): Promise<void> => {
  const { channelName, limit = 50, direction = 'backwards' } = req.body;

  if (!channelName) {
    res.status(400).json({ error: 'channelName is required' });
    return;
  }

  try {
    // Get channel from Ably REST client
    const channel = ablyRest.channels.get(channelName);
    console.log("Fetching history for channel:", channelName);

    // Use the REST client's history method with better error handling
    const historyResult = await new Promise<any>((resolve, reject) => {
      channel.history({
        limit: Math.min(limit, 100),
        direction: direction
      }, (err, resultPage) => {
        if (err) {
          reject(err);
        } else {
          resolve(resultPage);
        }
      });
    });

    // Check if we got a valid response
    if (!historyResult) {
      throw new Error('Ably history returned undefined response');
    }

    // Type the history page properly
    interface HistoryPage {
      items: Array<{
        id: string;
        data: any;
        timestamp: number;
        name?: string;
        clientId?: string;
      }>;
      hasNext?: () => Promise<boolean> | boolean;
      next?: () => Promise<HistoryPage | null>;
    }

    const historyPage = historyResult as HistoryPage;

    // Extract items from the history page with safe fallback
    const ablyMessages = historyPage.items || [];
    console.log(`Found ${ablyMessages.length} historical messages for channel ${channelName}`);

    // Convert Ably messages to your Message format
    const messages: Message[] = ablyMessages.map((ablyMessage) => {
      try {
        // Handle different message data formats
        const messageData = ablyMessage.data || {};
        
        return {
          id: ablyMessage.id || uuidv4(),
          senderId: messageData.senderId || ablyMessage.clientId || 'unknown',
          senderName: messageData.senderName || 'Unknown User',
          content: messageData.content || '',
          messageType: messageData.messageType || 'text',
          timestamp: new Date(ablyMessage.timestamp || Date.now()).toISOString(),
          read: messageData.read || false,
          options: messageData.options || {}
        };
      } catch (parseError) {
        console.error('Error parsing message:', ablyMessage, parseError);
        // Return a fallback message for corrupted data
        return {
          id: uuidv4(),
          senderId: 'system',
          senderName: 'System',
          content: 'Unable to load message',
          messageType: 'error',
          timestamp: new Date().toISOString(),
          read: true,
          options: {}
        };
      }
    });

    // If direction is backwards, reverse to get chronological order
    const sortedMessages = direction === 'backwards' ? messages.reverse() : messages;

    // Update local channel cache
    const channelInfo = activeChannels.get(channelName);
    if (channelInfo) {
      const existingMessageIds = new Set(channelInfo.messages.map(msg => msg.id));
      const newMessages = sortedMessages.filter(msg => !existingMessageIds.has(msg.id));
      channelInfo.messages = [...newMessages, ...channelInfo.messages].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      activeChannels.set(channelName, channelInfo);
    }

    // Check if there are more messages (with safe fallback)
    let hasMore = false;
    try {
      if (historyPage.hasNext && typeof historyPage.hasNext === 'function') {
        hasMore = await Promise.resolve(historyPage.hasNext());
      }
    } catch (hasNextError) {
      console.warn('Error checking hasNext:', hasNextError);
      hasMore = false;
    }

    res.status(200).json({
      success: true,
      messages: sortedMessages,
      hasMore,
      totalCount: sortedMessages.length
    });

  } catch (error) {
    console.error('Error fetching message history:', error);
    
    // Enhanced fallback logic with better debugging
    console.log('Attempting fallback to local storage for channel:', channelName);
    
    try {
      const channelInfo = activeChannels.get(channelName);
      if (channelInfo && channelInfo.messages.length > 0) {
        const localMessages = channelInfo.messages
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          .slice(-limit);
        
        console.log(`Fallback: Found ${localMessages.length} local messages for channel ${channelName}`);
        
        res.status(200).json({
          success: true,
          messages: localMessages,
          hasMore: false,
          fallback: true,
          totalCount: localMessages.length
        });
        return;
      } else {
        console.log(`Fallback: No local messages found for channel ${channelName}`);
        res.status(200).json({
          success: true,
          messages: [],
          hasMore: false,
          fallback: true,
          totalCount: 0
        });
        return;
      }
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      // Final fallback - empty response
      res.status(200).json({
        success: true,
        messages: [],
        hasMore: false,
        fallback: true,
        totalCount: 0,
        error: 'Both Ably and fallback failed'
      });
    }
  }
};
