const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  picture: {
    type: String
  },
  subscription: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free'
  },
  usageStats: {
    videosAnalyzed: {
      type: Number,
      default: 0
    },
    commentsProcessed: {
      type: Number,
      default: 0
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    }
  },
  channels: [{
    channelId: String,
    channelName: String,
    thumbnailUrl: String
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

// Method to check if user has reached free plan limit
userSchema.methods.hasReachedFreeLimit = function() {
  // Reset counter if it's a new month
  const now = new Date();
  const lastReset = new Date(this.usageStats.lastResetDate);
  
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    this.usageStats.videosAnalyzed = 0;
    this.usageStats.lastResetDate = now;
    return false;
  }
  
  // Check if user is on free plan and has reached limit
  return this.subscription === 'free' && this.usageStats.videosAnalyzed >= 3;
};

// Method to increment videos analyzed count
userSchema.methods.incrementVideosAnalyzed = function(commentCount) {
  this.usageStats.videosAnalyzed += 1;
  this.usageStats.commentsProcessed += commentCount || 0;
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
