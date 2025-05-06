// Content script for YouTube comment scraping

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getVideoInfo') {
    sendResponse(getVideoInfo());
  } else if (request.action === 'scrapeComments') {
    scrapeComments().then(sendResponse);
    return true; // Required for async sendResponse
  }
});

// Get current video information
function getVideoInfo() {
  try {
    const videoId = new URLSearchParams(window.location.search).get('v');
    
    if (!videoId) return null;
    
    // Get video title
    const titleElement = document.querySelector('h1.ytd-watch-metadata');
    const title = titleElement ? titleElement.textContent.trim() : 'Unknown Title';
    
    // Get video thumbnail
    const thumbnail = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
    
    // Get channel name
    const channelElement = document.querySelector('#owner #channel-name');
    const channel = channelElement ? channelElement.textContent.trim() : 'Unknown Channel';
    
    return {
      videoId,
      title,
      thumbnail,
      channel,
      url: window.location.href
    };
  } catch (error) {
    console.error('Error getting video info:', error);
    return null;
  }
}

// Scrape comments from the current YouTube video
async function scrapeComments(maxComments = 1000) {
  try {
    const comments = [];
    let lastCommentCount = 0;
    let attempts = 0;
    const maxAttempts = 10;
    
    // Scroll to comments section
    const commentsSection = document.querySelector('#comments');
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Wait for comments to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Scroll and collect comments until we have enough or no new comments are loaded
    while (comments.length < maxComments && attempts < maxAttempts) {
      // Extract currently visible comments
      const commentElements = document.querySelectorAll('ytd-comment-thread-renderer');
      
      for (let i = lastCommentCount; i < commentElements.length && comments.length < maxComments; i++) {
        const commentElement = commentElements[i];
        
        try {
          // Author info
          const authorElement = commentElement.querySelector('#author-text');
          const authorName = authorElement ? authorElement.textContent.trim() : 'Unknown User';
          
          // Comment text
          const contentElement = commentElement.querySelector('#content-text');
          const commentText = contentElement ? contentElement.textContent.trim() : '';
          
          // Timestamp
          const timestampElement = commentElement.querySelector('.published-time-text');
          const timestamp = timestampElement ? timestampElement.textContent.trim() : '';
          
          // Like count
          const likeElement = commentElement.querySelector('#vote-count-middle');
          const likeCount = likeElement ? likeElement.textContent.trim() : '0';
          
          // Comment ID
          const commentId = commentElement.getAttribute('id') || 
                           `comment-${Math.random().toString(36).substring(2, 15)}`;
          
          // Add to comments array
          if (commentText) {
            comments.push({
              id: commentId,
              author: authorName,
              text: commentText,
              timestamp,
              likeCount: parseNumberFromString(likeCount),
              isReply: false
            });
          }
          
          // Get replies if any
          const repliesElement = commentElement.querySelector('ytd-comment-replies-renderer');
          if (repliesElement) {
            // Check if replies are expanded
            const expandButton = repliesElement.querySelector('#more-replies');
            if (expandButton) {
              expandButton.click();
              // Wait for replies to load
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            // Extract replies
            const replyElements = repliesElement.querySelectorAll('ytd-comment-renderer');
            for (const replyElement of replyElements) {
              const replyAuthorElement = replyElement.querySelector('#author-text');
              const replyAuthor = replyAuthorElement ? replyAuthorElement.textContent.trim() : 'Unknown User';
              
              const replyContentElement = replyElement.querySelector('#content-text');
              const replyText = replyContentElement ? replyContentElement.textContent.trim() : '';
              
              const replyTimestampElement = replyElement.querySelector('.published-time-text');
              const replyTimestamp = replyTimestampElement ? replyTimestampElement.textContent.trim() : '';
              
              const replyLikeElement = replyElement.querySelector('#vote-count-middle');
              const replyLikeCount = replyLikeElement ? replyLikeElement.textContent.trim() : '0';
              
              const replyId = replyElement.getAttribute('id') || 
                             `reply-${Math.random().toString(36).substring(2, 15)}`;
              
              if (replyText) {
                comments.push({
                  id: replyId,
                  author: replyAuthor,
                  text: replyText,
                  timestamp: replyTimestamp,
                  likeCount: parseNumberFromString(replyLikeCount),
                  isReply: true,
                  parentId: commentId
                });
              }
            }
          }
        } catch (error) {
          console.error('Error parsing comment:', error);
        }
      }
      
      // Check if we got new comments
      if (comments.length === lastCommentCount) {
        attempts++;
      } else {
        lastCommentCount = comments.length;
        attempts = 0;
      }
      
      // Scroll to load more comments
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`Scraped ${comments.length} comments`);
    return { comments };
  } catch (error) {
    console.error('Error scraping comments:', error);
    return { error: error.message };
  }
}

// Helper function to parse number from string (e.g., "1.2K" -> 1200)
function parseNumberFromString(str) {
  if (!str) return 0;
  
  str = str.trim().toLowerCase();
  
  if (str === '') return 0;
  
  try {
    if (str.endsWith('k')) {
      return Math.round(parseFloat(str.replace('k', '')) * 1000);
    } else if (str.endsWith('m')) {
      return Math.round(parseFloat(str.replace('m', '')) * 1000000);
    } else {
      return parseInt(str, 10) || 0;
    }
  } catch (e) {
    return 0;
  }
}
