// Background script for CreatorComment Compass extension

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Open onboarding page
    chrome.tabs.create({
      url: 'http://localhost:5173/onboarding'
    });
  }
});

// Handle auth token refresh
chrome.identity.onSignInChanged.addListener((account, signedIn) => {
  if (!signedIn) {
    // Clear stored token when user signs out
    chrome.storage.local.remove('authToken');
  }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getAuthToken') {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      sendResponse({ token });
    });
    return true; // Required for async sendResponse
  }
});

// Add badge to show when on YouTube
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('youtube.com/watch')) {
    // Set badge when on a YouTube video page
    chrome.action.setBadgeText({ text: 'ON', tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#4285F4', tabId });
  } else {
    // Clear badge when not on a YouTube video page
    chrome.action.setBadgeText({ text: '', tabId });
  }
});
