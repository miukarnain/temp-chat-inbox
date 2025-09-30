import { Router } from 'express';
import { 
  getAblyToken, 
  createChannel, 
  sendMessage,
  getUserChannels, 
  getInitialMessages,
  getMockUsers,
  getMessageHistory
} from '../controllers/chatControllers';

const router: Router = Router();

// Get Ably token for client authentication
router.get('/token', getAblyToken);

// Create a unique channel for user conversation
router.post('/channel', createChannel);

// Send a message to a specific channel
router.post('/message', sendMessage);

// Get all channels for a user
router.get('/channels/:userId', getUserChannels);

// Get initial messages for a user
router.post('/initial-messages', getInitialMessages);

// Get mock users
router.get('/mock-users', getMockUsers);

// Get message history for a channel
router.post('/message-history', getMessageHistory); 

export default router;