const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const Video = require('../models/Video');
const Comment = require('../models/Comment');

// Get all videos for the current user
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select('videoId title thumbnailUrl commentCount stats.sentiment createdAt');
    
    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Get a specific video with its stats
router.get('/:videoId', async (req, res) => {
  try {
    const video = await Video.findOne({ 
      userId: req.user.id,
      videoId: req.params.videoId
    });
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    res.json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

// Get comments for a specific video
router.get('/:videoId/comments', async (req, res) => {
  try {
    const { videoId } = req.params;
    const { 
      sentiment, 
      tags, 
      search,
      page = 1,
      limit = 50,
      sortBy = 'likeCount',
      sortOrder = 'desc'
    } = req.query;
    
    // Build query
    const query = { 
      userId: req.user.id,
      videoId 
    };
    
    // Add sentiment filter if provided
    if (sentiment) {
      query['analysis.sentiment'] = sentiment;
    }
    
    // Add tags filter if provided
    if (tags) {
      const tagList = tags.split(',');
      query['analysis.tags'] = { $in: tagList };
    }
    
    // Add text search if provided
    if (search) {
      query.text = { $regex: search, $options: 'i' };
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Determine sort order
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Execute query with pagination
    const comments = await Comment.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await Comment.countDocuments(query);
    
    res.json({
      comments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Process and analyze comments for a video
router.post('/:videoId/comments', async (req, res) => {
  try {
    const { videoId } = req.params;
    const { comments, title, channel, thumbnail, url } = req.body;
    
    // Check if user has reached free plan limit
    const user = await User.findOne({ googleId: req.user.id });
    
    if (user.hasReachedFreeLimit() && user.subscription === 'free') {
      return res.status(403).json({ 
        error: 'Free plan limit reached',
        upgradeRequired: true
      });
    }
    
    // Check if video already exists
    let video = await Video.findOne({ userId: req.user.id, videoId });
    
    if (!video) {
      // Create new video
      video = new Video({
        videoId,
        userId: req.user.id,
        title: title || 'Untitled Video',
        channelName: channel || 'Unknown Channel',
        thumbnailUrl: thumbnail || `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
        url: url || `https://www.youtube.com/watch?v=${videoId}`,
        commentCount: comments.length
      });
      
      await video.save();
    }
    
    // Send comments to NLP service for analysis
    const nlpResponse = await axios.post(
      process.env.NLP_SERVICE_URL || 'http://localhost:8000/analyze',
      { comments }
    );
    
    const analyzedComments = nlpResponse.data.comments;
    
    // Update video stats based on analysis
    const stats = {
      sentiment: { positive: 0, neutral: 0, negative: 0 },
      categories: { questions: 0, praise: 0, suggestions: 0, complaints: 0, spam: 0 },
      languages: {},
      keywords: []
    };
    
    // Process each analyzed comment
    const commentPromises = analyzedComments.map(async (comment) => {
      // Update sentiment stats
      stats.sentiment[comment.analysis.sentiment]++;
      
      // Update category stats
      comment.analysis.tags.forEach(tag => {
        if (tag === 'question') stats.categories.questions++;
        if (tag === 'praise') stats.categories.praise++;
        if (tag === 'suggestion') stats.categories.suggestions++;
        if (tag === 'complaint') stats.categories.complaints++;
        if (tag === 'spam') stats.categories.spam++;
      });
      
      // Update language stats
      const lang = comment.analysis.language;
      stats.languages[lang] = (stats.languages[lang] || 0) + 1;
      
      // Track keywords
      comment.analysis.keywords.forEach(keyword => {
        const existingKeyword = stats.keywords.find(k => k.word === keyword);
        if (existingKeyword) {
          existingKeyword.count++;
        } else {
          stats.keywords.push({ word: keyword, count: 1 });
        }
      });
      
      // Save comment to database
      const newComment = new Comment({
        commentId: comment.id,
        videoId,
        userId: req.user.id,
        author: comment.author,
        text: comment.text,
        timestamp: comment.timestamp,
        likeCount: comment.likeCount,
        isReply: comment.isReply || false,
        parentId: comment.parentId || null,
        analysis: comment.analysis
      });
      
      // Use updateOne with upsert to avoid duplicates
      return Comment.updateOne(
        { videoId, commentId: comment.id },
        { $set: newComment.toObject() },
        { upsert: true }
      );
    });
    
    // Wait for all comments to be saved
    await Promise.all(commentPromises);
    
    // Sort keywords by count and limit to top 20
    stats.keywords.sort((a, b) => b.count - a.count);
    stats.keywords = stats.keywords.slice(0, 20);
    
    // Update video with stats
    video.stats = stats;
    video.commentCount = comments.length;
    
    // Generate content ideas based on analysis
    if (nlpResponse.data.contentIdeas) {
      video.contentIdeas = nlpResponse.data.contentIdeas;
    }
    
    await video.save();
    
    // Increment user's usage stats
    await user.incrementVideosAnalyzed(comments.length);
    
    res.json({
      success: true,
      videoId,
      stats,
      commentCount: comments.length
    });
  } catch (error) {
    console.error('Error processing comments:', error);
    res.status(500).json({ error: 'Failed to process comments' });
  }
});

module.exports = router;
