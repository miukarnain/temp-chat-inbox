import { Chat, User } from '../types/chat';

export const getInitialMessagesfromMockData = (userId: string): Chat => ({
  id: '1',
  recipient: {
    id: 'bot',
    name: 'Toothsome Bot',
  },
  messages: [
    {
      id: '1',
      content: 'Hi there! I\'m Derik from Toothsome',
      senderId: 'bot',
      senderName: 'Toothsome Bot',
      messageType: 'text',
      timestamp: new Date().toISOString(),
      read: false,
    },
    {
      id: '2',
      content:
        'To match you with the provider you\'re interested in, we just need you to answer a couple of quick, easy questions to get pre-qualified!',
      senderId: 'bot',
      senderName: 'Toothsome Bot',
      messageType: 'text',
      timestamp: new Date().toISOString(),
      read: false,
    },
    {
      id: '3',
      content: 'When did you first start considering dental implants?',
      senderId: 'bot',
      senderName: 'Toothsome Bot',
      messageType: 'option',
      timestamp: new Date().toISOString(),
      read: false,
      options: ['Less than 6 months', 'More than 6 months', 'I\'m just getting started'],
    },
  ],
  currentStep: 'initial',
  channelName: undefined,
});

export const getMockUsersFromMockData: User[] = [
  {
    id: '1',
    name: 'Jed',
    lastMessage: 'Awesome! your appointment!...',
    timestamp: '2 min ago'
  },
  {
    id: '2',
    name: 'Sarah',
    lastMessage: 'When did you first start consi...'
  },
  {
    id: '3',
    name: 'Mike',
    lastMessage: 'Hi Mike, I\'m Derik from Teqdh...',
    timestamp: '10 min ago'
  },
  {
    id: '4',
    name: 'Emily',
    lastMessage: 'Looking for appointment slots...',
    timestamp: '1 hour ago'
  }
];
