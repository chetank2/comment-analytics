const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  commentId: {
    type: String,
    required: true
  },
  videoId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: String
  },
  likeCount: {
    type: Number,
    default: 0
  },
  isReply: {
    type: Boolean,
    default: false
  },
  parentId: {
    type: String,
    default: null
  },
  analysis: {
    language: {
      type: String,
      default: 'en'
    },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      default: 'neutral'
    },
    tags: [{
      type: String,
      enum: ['question', 'praise', 'suggestion', 'complaint', 'spam']
    }],
    keywords: [String],
    relevance: {
      type: Number,
      default: 0.5,
      min: 0,
      max: 1
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create compound index for videoId and commentId
commentSchema.index({ videoId: 1, commentId: 1 }, { unique: true });

// Create index for searching by userId
commentSchema.index({ userId: 1 });

// Create index for searching by tags
commentSchema.index({ 'analysis.tags': 1 });

// Create index for searching by sentiment
commentSchema.index({ 'analysis.sentiment': 1 });

module.exports = mongoose.model('Comment', commentSchema);
