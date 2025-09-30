import { User, Chat } from '@/types/chat';
import { Provider } from "@/types/chat";

export const mockUsers: User[] = [
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

export const mockProvider: Provider = {
  id: "1",
  name: "Dr. Smith",
  description: "Specialist in Dental Implants with over 15 years of hands-on experience.",
  rating: 4.8,
  reviewCount: 120,
  address: "New York, NY",
  consultationFee: 200,
  discountedFee: 150,
  specialty: "Dental Implants",
};

export const mockAppointmentSlots = [
  { date: '2024-01-15', time: '10:00 AM', formattedDate: 'Mon, Jan 15 - 10:00 AM' },
  { date: '2024-01-16', time: '2:00 PM', formattedDate: 'Tue, Jan 16 - 2:00 PM' },
  { date: '2024-01-17', time: '11:00 AM', formattedDate: 'Wed, Jan 17 - 11:00 AM' },
  { date: '2024-01-18', time: '3:30 PM', formattedDate: 'Thu, Jan 18 - 3:30 PM' }
];

export const initialMessages = (userId: string): Chat => ({
  id: '1',
  recipient: {
    id: 'bot',
    name: 'Toothsome Bot'
  },
  messages: [
    {
      id: '1',
      content: 'Hi there! I\'m Derik from Toothsome',
      senderId: 'bot',
      timestamp: new Date(),
    },
    {
      id: '2',
      content: 'To match you with the provider you\'re interested in, we just need you to answer a couple of quick, easy questions to get pre-qualified!',
      senderId: 'bot',
      timestamp: new Date(),
    },
    {
      id: '3',
      content: 'When did you first start considering dental implants?',
      senderId: 'bot',
      timestamp: new Date(),
      messageType: 'option',
      options: ['Less than 6 months', 'More than 6 months', 'I\'m just getting started']
    }
  ],
  currentStep: 'initial',
  channelName: undefined
});