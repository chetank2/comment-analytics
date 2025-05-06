const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Video = require('../models/Video');
const Comment = require('../models/Comment');

// Get current user's profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.user.id });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      subscription: user.subscription,
      channels: user.channels,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Get user's usage statistics
router.get('/usage', async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.user.id });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if it's a new month and reset if needed
    const now = new Date();
    const lastReset = new Date(user.usageStats.lastResetDate);
    
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      user.usageStats.videosAnalyzed = 0;
      user.usageStats.lastResetDate = now;
      await user.save();
    }
    
    // Get total videos and comments
    const totalVideos = await Video.countDocuments({ userId: req.user.id });
    const totalComments = await Comment.countDocuments({ userId: req.user.id });
    
    res.json({
      subscription: user.subscription,
      videosAnalyzed: user.usageStats.videosAnalyzed,
      commentsProcessed: user.usageStats.commentsProcessed,
      totalVideos,
      totalComments,
      limit: user.subscription === 'free' ? 3 : Infinity,
      remaining: user.subscription === 'free' ? Math.max(0, 3 - user.usageStats.videosAnalyzed) : Infinity,
      resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1)
    });
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    res.status(500).json({ error: 'Failed to fetch usage statistics' });
  }
});

// Update user's subscription
router.post('/subscription', async (req, res) => {
  try {
    const { subscription } = req.body;
    
    if (!subscription || !['free', 'pro'].includes(subscription)) {
      return res.status(400).json({ error: 'Invalid subscription type' });
    }
    
    const user = await User.findOneAndUpdate(
      { googleId: req.user.id },
      { subscription },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      subscription: user.subscription
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// Add a YouTube channel
router.post('/channels', async (req, res) => {
  try {
    const { channelId, channelName, thumbnailUrl } = req.body;
    
    if (!channelId || !channelName) {
      return res.status(400).json({ error: 'Channel ID and name are required' });
    }
    
    const user = await User.findOne({ googleId: req.user.id });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if channel already exists
    const channelExists = user.channels.some(channel => channel.channelId === channelId);
    
    if (!channelExists) {
      user.channels.push({
        channelId,
        channelName,
        thumbnailUrl
      });
      
      await user.save();
    }
    
    res.json({
      channels: user.channels
    });
  } catch (error) {
    console.error('Error adding channel:', error);
    res.status(500).json({ error: 'Failed to add channel' });
  }
});

module.exports = router;
