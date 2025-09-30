import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables FIRST - before any other imports
dotenv.config();

// Now import other modules
import chatRoutes from './routes/chatRoutes';

console.log('🔧 Environment check:');
console.log('   ABLY_API_KEY exists:', !!process.env.ABLY_API_KEY);
console.log('   ABLY_API_KEY length:', process.env.ABLY_API_KEY?.length || 0);
console.log('   PORT:', process.env.PORT);

// If no ABLY_API_KEY, use a mock value for development
if (!process.env.ABLY_API_KEY) {
  console.warn('⚠️  ABLY_API_KEY not found, using mock value for development');
  process.env.ABLY_API_KEY = 'mock-key-for-development-' + Date.now();
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/chat', chatRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Chat server is running',
    ablyConfigured: !!process.env.ABLY_API_KEY
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Ably configured: ${!!process.env.ABLY_API_KEY}`);
});