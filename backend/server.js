const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// Connect to MongoDB - disabled for demo
console.log('MongoDB connection disabled for demo');

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Import routes
const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/videos');
const userRoutes = require('./routes/users');

// Use routes - commented out for demo
// app.use('/api/auth', authRoutes);
// app.use('/api/videos', authenticateToken, videoRoutes);
// app.use('/api/user', authenticateToken, userRoutes);

// Mock auth endpoint for demo
app.post('/api/auth/google', (req, res) => {
  res.json({
    user: {
      id: 'demo-user-id',
      name: 'Demo User',
      email: 'demo@example.com',
      picture: 'https://ui-avatars.com/api/?name=Demo+User&background=random',
      subscription: 'free'
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    user: {
      id: 'demo-user-id',
      name: 'Demo User',
      email: 'demo@example.com',
      picture: 'https://ui-avatars.com/api/?name=Demo+User&background=random',
      subscription: 'free',
      usageStats: {
        videosAnalyzed: 2,
        commentsProcessed: 205
      }
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Mock endpoints for demo
app.get('/api/videos', (req, res) => {
  res.json([
    {
      videoId: 'demo1',
      title: 'Demo Video 1',
      thumbnailUrl: 'https://i.ytimg.com/vi/demo1/mqdefault.jpg',
      commentCount: 120,
      stats: {
        sentiment: { positive: 80, neutral: 30, negative: 10 }
      },
      createdAt: new Date()
    },
    {
      videoId: 'demo2',
      title: 'Demo Video 2',
      thumbnailUrl: 'https://i.ytimg.com/vi/demo2/mqdefault.jpg',
      commentCount: 85,
      stats: {
        sentiment: { positive: 50, neutral: 25, negative: 10 }
      },
      createdAt: new Date()
    }
  ]);
});

app.get('/api/user/usage', (req, res) => {
  res.json({
    subscription: 'free',
    videosAnalyzed: 2,
    commentsProcessed: 205,
    totalVideos: 2,
    totalComments: 205,
    limit: 3,
    remaining: 1,
    resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
  });
});

app.get('/api/videos/:videoId', (req, res) => {
  const videoId = req.params.videoId;
  res.json({
    videoId,
    title: `Demo Video ${videoId}`,
    channelName: 'Demo Channel',
    thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    commentCount: 120,
    stats: {
      sentiment: { positive: 80, neutral: 30, negative: 10 },
      categories: {
        questions: 25,
        praise: 60,
        suggestions: 15,
        complaints: 10,
        spam: 10
      },
      languages: { 'en': 100, 'es': 15, 'fr': 5 },
      keywords: [
        { word: 'great', count: 25 },
        { word: 'awesome', count: 18 },
        { word: 'helpful', count: 15 },
        { word: 'tutorial', count: 12 },
        { word: 'thanks', count: 10 }
      ]
    },
    contentIdeas: [
      { idea: 'How to improve your content creation workflow', source: 'Based on user questions', relevance: 0.9 },
      { idea: 'Advanced techniques for YouTube creators', source: 'Based on user suggestions', relevance: 0.8 },
      { idea: 'Tips for growing your channel faster', source: 'Based on user comments', relevance: 0.7 }
    ],
    createdAt: new Date()
  });
});

app.get('/api/videos/:videoId/comments', (req, res) => {
  const comments = [];
  for (let i = 1; i <= 50; i++) {
    comments.push({
      _id: `comment${i}`,
      commentId: `comment${i}`,
      videoId: req.params.videoId,
      author: `User ${i}`,
      text: `This is a sample comment ${i}. ${i % 5 === 0 ? 'I have a question about this video?' : 'Great content!'}`,
      timestamp: '2 days ago',
      likeCount: Math.floor(Math.random() * 100),
      isReply: i % 7 === 0,
      parentId: i % 7 === 0 ? `comment${i-1}` : null,
      analysis: {
        language: 'en',
        sentiment: i % 3 === 0 ? 'positive' : (i % 5 === 0 ? 'negative' : 'neutral'),
        tags: [
          i % 5 === 0 ? 'question' : (i % 4 === 0 ? 'praise' : (i % 3 === 0 ? 'suggestion' : 'spam'))
        ],
        keywords: ['video', 'content', 'great', 'awesome'],
        relevance: Math.random()
      }
    });
  }

  res.json({
    comments,
    pagination: {
      total: 120,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
      pages: 3
    }
  });
});

// NLP Service proxy endpoint
app.post('/api/analyze', authenticateToken, async (req, res) => {
  try {
    const { comments } = req.body;

    if (!comments || !Array.isArray(comments)) {
      return res.status(400).json({ error: 'Invalid comments data' });
    }

    // Forward to NLP service
    const nlpResponse = await axios.post(process.env.NLP_SERVICE_URL || 'http://localhost:8000/analyze', {
      comments
    });

    return res.json(nlpResponse.data);
  } catch (error) {
    console.error('NLP service error:', error);
    return res.status(500).json({ error: 'Failed to analyze comments' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
