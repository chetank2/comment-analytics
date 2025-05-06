const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  channelName: {
    type: String
  },
  thumbnailUrl: {
    type: String
  },
  url: {
    type: String
  },
  commentCount: {
    type: Number,
    default: 0
  },
  stats: {
    sentiment: {
      positive: {
        type: Number,
        default: 0
      },
      neutral: {
        type: Number,
        default: 0
      },
      negative: {
        type: Number,
        default: 0
      }
    },
    categories: {
      questions: {
        type: Number,
        default: 0
      },
      praise: {
        type: Number,
        default: 0
      },
      suggestions: {
        type: Number,
        default: 0
      },
      complaints: {
        type: Number,
        default: 0
      },
      spam: {
        type: Number,
        default: 0
      }
    },
    languages: {
      type: Map,
      of: Number,
      default: {}
    },
    keywords: [{
      word: String,
      count: Number
    }]
  },
  contentIdeas: [{
    idea: String,
    source: String,
    relevance: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create a compound index for userId and videoId
videoSchema.index({ userId: 1, videoId: 1 }, { unique: true });

module.exports = mongoose.model('Video', videoSchema);
