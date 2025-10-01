'use client';
 
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ChatSidebar from '@/components/ChatSidebar';
import ChatInterface from '@/components/ChatInterface';
import { User, Message, Chat as ChatType } from '@/types/chat';
import { mockUsers, mockProvider, mockAppointmentSlots } from '@/data/mockData';
import { chatAPI } from '@/services/chatAPI';
 
export default function ChatPage() {
  const params = useParams();
  const userId = params.userId as string;
  const userName = params.userName as string;
  
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [currentChat, setCurrentChat] = useState<ChatType | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 
  // Guard to avoid double-invocation in React Strict Mode and prevent duplicate loads
  const lastLoadedKeyRef = useRef<string | null>(null);
 
  // Generate channel name based on user
  const generateChannelName = (userId: string, userName: string): string => {
    const sanitizedUserId = userId.toLowerCase().replace(/[^a-z0-9]/g, '');
    const sanitizedUserName = userName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${process.env.CHANNEL_NAME_SPACE}${sanitizedUserId}_${sanitizedUserName}_toothsomeChatBot`;
  };
 
  // Helper function to determine current step from messages
  const determineCurrentStep = (messages: Message[]): 'initial' | 'provider' | 'booking' | 'confirmed' => {
    if (messages.length === 0) return 'initial';
    
    const lastMessage = messages[messages.length - 1];
    
    // Check if appointment is confirmed
    if (lastMessage.content.includes('appointment is booked')) {
      return 'confirmed';
    }
    
    // Check if we're in booking step (showing appointment slots)
    if (lastMessage.options && lastMessage.options.length > 0) {
      return 'booking';
    }
    
    // Check if we're in provider step
    if (lastMessage.content.includes('provider') || lastMessage.messageType === 'provider') {
      return 'provider';
    }
    
    // Default to initial step
    return 'initial';
  };
 
  const loadChatHistory = async (userId: string, userName: string) => {
    setLoading(true);
    setError(null);
 
    try {
      // Load mock users from API
      const usersResponse = await chatAPI.getMockUsers();
      setUsers(usersResponse.users);
 
      // Find current user from the loaded users
      const currentUser = usersResponse.users.find(user => user.name === userName);
      const currentUserID = currentUser?.id || '1';
      const currentUserNameValue = currentUser?.name || 'User';
      
      setCurrentUserName(currentUserNameValue);
      setCurrentUserId(currentUserID);
 
      // Generate channel name for this user
      const channelName = generateChannelName(currentUserID, currentUserNameValue);
 
      try {
        // First, try to get message history from the channel
        console.log('Attempting to load message history for channel:', channelName);
        const historyResponse = await chatAPI.getMessageHistory({
          channelName,
          limit: 100,
          direction: 'backwards'
        });
 
        if (historyResponse.success && historyResponse.messages.length > 0) {
          console.log('Found message history with', historyResponse.messages.length, 'messages');
          // Convert timestamp strings to Date objects
          const messagesWithDates = historyResponse.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
 
          // Determine current step based on the messages
          const currentStep = determineCurrentStep(messagesWithDates);
 
          const chatFromHistory: ChatType = {
            id: `chat-${currentUserID}`,
            recipient: {
              id: currentUserID,
              name: currentUserNameValue
            },
            channelName: channelName,
            messages: messagesWithDates,
            currentStep: currentStep
          };
 
          setCurrentChat(chatFromHistory);
        } else {
          // No history found, load initial messages
          console.log('No message history found, loading initial messages');
          await loadInitialMessages(currentUserID, currentUserNameValue, channelName);
        }
      } catch (historyError) {
        console.log('Message history not available, loading initial messages:', historyError);
        // If history fails (channel doesn't exist or other error), load initial messages
        await loadInitialMessages(currentUserID, currentUserNameValue, channelName);
      }
 
    } catch (err) {
      console.error('Failed to load chat:', err);
      setError('Failed to load chat messages');
    } finally {
      setLoading(false);
    }
  };
 
  const loadInitialMessages = async (userId: string, userName: string, channelName: string) => {
    try {
      // Load initial messages from API service
      const response = await chatAPI.getInitialMessages(userId);
      console.log("Loaded initial messages:", response);
      
      // Convert timestamp strings to Date objects and ensure proper ChatType structure
      const chatWithDateTimestamps: ChatType = {
        ...response.chat,
        channelName: channelName, // Add channel name to initial chat
        messages: response.chat.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      };
      
      setCurrentChat(chatWithDateTimestamps);
      
    } catch (err) {
      console.error('Failed to load initial messages:', err);
      throw err;
    }
  };
 
  useEffect(() => {
    if (!userName) return;
 
    const loadKey = `${userId || ''}:${userName}`;
    if (lastLoadedKeyRef.current === loadKey) return;
    lastLoadedKeyRef.current = loadKey;
 
    console.log("this is useEffect");
    loadChatHistory(userId, userName);
  }, [userId, userName]);
 
  const handleLoadMoreMessages = (newMessages: Message[]) => {
    setCurrentChat(prev => {
      if (!prev) return null;
      
      // Merge and deduplicate messages
      const existingMessageIds = new Set(prev.messages.map(msg => msg.id));
      const uniqueNewMessages = newMessages.filter(msg => !existingMessageIds.has(msg.id));
      
      // Sort by timestamp
      const allMessages = [...uniqueNewMessages, ...prev.messages].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
 
      // Update current step based on new messages
      const updatedStep = determineCurrentStep(allMessages);
      
      return {
        ...prev,
        messages: allMessages,
        currentStep: updatedStep
      };
    });
  };
 
  const handleSendMessage = async (content: string) => {
    console.log("handleSendMessage 222")
    if (!currentChat) return;
 
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      senderId: currentUserId,
      senderName: currentUserName,
      timestamp: new Date(),
    };
 
    // Update local state immediately for better UX
    setCurrentChat(prev => prev ? ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }) : null);
 
    try {
      let targetChannelName = currentChat.channelName;
 
      // Create channel if it doesn't exist (should exist from history load, but just in case)
      if (!targetChannelName) {
        const channelResponse = await chatAPI.createChannel({
          userId: currentUserId,
          recipientName: currentUserName
        });
        
        targetChannelName = channelResponse.channelName;
        
        // Update chat with channel name
        setCurrentChat(prev => prev ? ({
          ...prev,
          channelName: targetChannelName
        }) : null);
      }
 
      // Send message through backend
      if (targetChannelName) {
        await chatAPI.sendMessage({
          channelName: targetChannelName,
          senderId: currentUserId,
          senderName: currentUserName,
          content: content,
          messageType: 'text'
        });
      }
 
      // Simulate bot response after successful backend send
      setTimeout(() => {
        handleBotResponse(content);
      }, 1000);
 
    } catch (error) {
      console.error('Failed to send message to backend:', error);
    }
  };
 
  const handleBotResponse = (userMessage: string) => {
    if (!currentChat) return;
    
    let botResponse: Message;
    let nextStep: 'initial' | 'provider' | 'booking' | 'confirmed' = currentChat.currentStep;
    
    switch (currentChat.currentStep) {
      case 'initial':
        botResponse = {
          id: Date.now().toString(),
          content: 'Awesome! You have completed the pre qualification.\n\nI have found the below provider for your initial consultation',
          senderId: 'bot',
          senderName: 'Toothsome Bot',
          timestamp: new Date(),
          messageType: 'provider'
        };
        nextStep = 'provider';
        break;
 
      case 'provider':
        if (userMessage.toLowerCase().includes('yes')) {
          botResponse = {
            id: Date.now().toString(),
            content: 'Looking for appointment slots...',
            senderId: 'bot',
            senderName: 'Toothsome Bot',
            timestamp: new Date(),
            messageType: 'appointment'
          };
          
          setTimeout(() => {
            const appointmentMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: 'Here are the available appointment slots:',
              senderId: 'bot',
              senderName: 'Toothsome Bot',
              timestamp: new Date(),
              messageType: 'option',
              options: mockAppointmentSlots.map(slot => slot.formattedDate)
            };
            
            setCurrentChat(prev => prev ? ({
              ...prev,
              currentStep: 'booking',
              messages: [...prev.messages, appointmentMessage]
            }) : null);
          }, 1500);
        } else {
          botResponse = {
            id: Date.now().toString(),
            content: 'Thank you for your message! How can I assist you further?',
            senderId: 'bot',
            senderName: 'Toothsome Bot',
            timestamp: new Date(),
          };
        }
        break;
 
      case 'booking':
        botResponse = {
          id: Date.now().toString(),
          content: 'Awesome! Your appointment is booked.',
          senderId: 'bot',
          senderName: 'Toothsome Bot',
          timestamp: new Date(),
        };
        nextStep = 'confirmed';
        break;
 
      default:
        botResponse = {
          id: Date.now().toString(),
          content: 'Thank you for your message! How can I assist you further?',
          senderId: 'bot',
          senderName: 'Toothsome Bot',
          timestamp: new Date(),
        };
    }
 
    // Update chat with bot response and new step
    setCurrentChat(prev => prev ? ({
      ...prev,
      currentStep: nextStep,
      messages: [...prev.messages, botResponse]
    }) : null);
  };
 
  // const handleUserSelect = (selectedUserId: string) => {
  //   const selectedUser = users.find(user => user.id === selectedUserId);
  //   if (selectedUser) {
  //     window.location.href = `/chat/${selectedUser.id}/${selectedUser.name}`;
  //   }
  // };
  const router = useRouter();
 
  const handleUserSelect = (selectedUserId: string) => {
    console.log("handle user select");
    router.push(`/chat/${selectedUserId}`);
  };
 
  if (loading) {
    return (
      <div className="h-screen flex bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }
 
  if (error) {
    return (
      <div className="h-screen flex bg-gray-50 items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-lg font-semibold">Error</p>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
 
  if (!currentChat) {
    return (
      <div className="h-screen flex bg-gray-50 items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No chat found</p>
        </div>
      </div>
    );
  }
 
  return (
    <div className="h-screen flex bg-gray-50">
      <ChatSidebar
        users={users}
        currentUserName={userName}
        onUserSelect={handleUserSelect}
      />
      <div className="flex-1 flex flex-col">
        <ChatInterface
          chat={currentChat}
          onSendMessage={handleSendMessage}
          onLoadMoreMessages={handleLoadMoreMessages}
          currentUserName={currentUserName}
          channelName={currentChat.channelName}
        />
      </div>
    </div>
  );
}