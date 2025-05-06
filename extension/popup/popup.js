// Configuration
const API_BASE_URL = 'http://localhost:3000/api';
const DASHBOARD_URL = 'http://localhost:5173';

// DOM Elements
const loginSection = document.getElementById('login-section');
const mainSection = document.getElementById('main-section');
const errorSection = document.getElementById('error-section');
const loginButton = document.getElementById('login-button');
const analyzeButton = document.getElementById('analyze-button');
const dashboardButton = document.getElementById('dashboard-button');
const videoSelect = document.getElementById('video-select');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');
const videoInfo = document.getElementById('video-info');
const videoThumbnail = document.getElementById('video-thumbnail');
const videoTitle = document.getElementById('video-title');
const status = document.getElementById('status');
const statusText = document.getElementById('status-text');
const errorMessage = document.getElementById('error-message');
const retryButton = document.getElementById('retry-button');
const videosAnalyzed = document.getElementById('videos-analyzed');
const upgradeLink = document.getElementById('upgrade-link');

// State
let currentUser = null;
let currentVideo = null;
let isOnYouTube = false;

// Initialize the popup
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Check if user is logged in
    const token = await getAuthToken();
    if (token) {
      currentUser = await fetchUserInfo(token);
      updateUI();
      
      // Check if we're on a YouTube video page
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const url = tabs[0]?.url || '';
      
      if (url.includes('youtube.com/watch')) {
        isOnYouTube = true;
        // Get video info from the page
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getVideoInfo' }, (response) => {
          if (response && response.videoId) {
            currentVideo = response;
            updateVideoInfo();
          }
        });
      } else {
        analyzeButton.disabled = true;
        analyzeButton.textContent = 'Not on a YouTube video page';
      }
      
      // Load previously analyzed videos
      loadPreviousVideos();
    } else {
      showLoginUI();
    }
  } catch (error) {
    showError('Failed to initialize: ' + error.message);
  }
});

// Event Listeners
loginButton.addEventListener('click', handleLogin);
analyzeButton.addEventListener('click', handleAnalyze);
dashboardButton.addEventListener('click', openDashboard);
videoSelect.addEventListener('change', handleVideoSelect);
retryButton.addEventListener('click', resetUI);
upgradeLink.addEventListener('click', openUpgradePage);

// Authentication Functions
async function handleLogin() {
  try {
    const token = await authenticateWithGoogle();
    if (token) {
      currentUser = await fetchUserInfo(token);
      updateUI();
      loadPreviousVideos();
    }
  } catch (error) {
    showError('Login failed: ' + error.message);
  }
}

async function authenticateWithGoogle() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        chrome.storage.local.set({ authToken: token });
        resolve(token);
      }
    });
  });
}

async function getAuthToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get('authToken', (data) => {
      resolve(data.authToken || null);
    });
  });
}

async function fetchUserInfo(token) {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }
  
  return response.json();
}

// Video Analysis Functions
async function handleAnalyze() {
  if (!currentVideo || !isOnYouTube) return;
  
  try {
    showStatus('Scraping comments...');
    
    // Send message to content script to scrape comments
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tabs[0].id, { action: 'scrapeComments' }, async (response) => {
      if (chrome.runtime.lastError) {
        showError('Error: ' + chrome.runtime.lastError.message);
        return;
      }
      
      if (response && response.comments) {
        showStatus(`Analyzing ${response.comments.length} comments...`);
        
        // Send comments to backend for analysis
        const token = await getAuthToken();
        const result = await sendCommentsForAnalysis(token, currentVideo.videoId, response.comments);
        
        if (result.success) {
          showStatus('Analysis complete!');
          setTimeout(() => {
            openDashboard(currentVideo.videoId);
          }, 1500);
          
          // Update videos analyzed count
          updateVideosAnalyzedCount();
        } else {
          showError('Analysis failed: ' + result.error);
        }
      } else {
        showError('No comments found or scraping failed');
      }
    });
  } catch (error) {
    showError('Analysis failed: ' + error.message);
  }
}

async function sendCommentsForAnalysis(token, videoId, comments) {
  try {
    const response = await fetch(`${API_BASE_URL}/videos/${videoId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        videoId,
        comments
      })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// UI Functions
function updateUI() {
  if (currentUser) {
    loginSection.classList.add('hidden');
    mainSection.classList.remove('hidden');
    errorSection.classList.add('hidden');
    
    userAvatar.src = currentUser.picture;
    userName.textContent = currentUser.name;
    
    // Get videos analyzed count
    updateVideosAnalyzedCount();
  } else {
    showLoginUI();
  }
}

function showLoginUI() {
  loginSection.classList.remove('hidden');
  mainSection.classList.add('hidden');
  errorSection.classList.add('hidden');
}

function updateVideoInfo() {
  if (currentVideo) {
    videoInfo.classList.remove('hidden');
    videoThumbnail.src = currentVideo.thumbnail;
    videoTitle.textContent = currentVideo.title;
    analyzeButton.disabled = false;
  } else {
    videoInfo.classList.add('hidden');
    analyzeButton.disabled = true;
  }
}

function showStatus(message) {
  status.classList.remove('hidden');
  statusText.textContent = message;
  analyzeButton.disabled = true;
  dashboardButton.disabled = true;
}

function hideStatus() {
  status.classList.add('hidden');
  analyzeButton.disabled = false;
  dashboardButton.disabled = false;
}

function showError(message) {
  loginSection.classList.add('hidden');
  mainSection.classList.add('hidden');
  errorSection.classList.remove('hidden');
  errorMessage.textContent = message;
}

function resetUI() {
  errorSection.classList.add('hidden');
  updateUI();
}

// Helper Functions
async function loadPreviousVideos() {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/videos`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const videos = await response.json();
      
      if (videos.length > 0) {
        videoSelect.innerHTML = '<option value="">Select a previous video</option>';
        videos.forEach(video => {
          const option = document.createElement('option');
          option.value = video.videoId;
          option.textContent = video.title;
          videoSelect.appendChild(option);
        });
        
        videoSelect.classList.remove('hidden');
      }
    }
  } catch (error) {
    console.error('Failed to load previous videos:', error);
  }
}

function handleVideoSelect(event) {
  const videoId = event.target.value;
  if (videoId) {
    openDashboard(videoId);
  }
}

function openDashboard(videoId = null) {
  const url = videoId 
    ? `${DASHBOARD_URL}/video/${videoId}` 
    : DASHBOARD_URL;
  
  chrome.tabs.create({ url });
}

function openUpgradePage() {
  chrome.tabs.create({ url: `${DASHBOARD_URL}/upgrade` });
}

async function updateVideosAnalyzedCount() {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/user/usage`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      videosAnalyzed.textContent = data.videosAnalyzed || 0;
    }
  } catch (error) {
    console.error('Failed to get usage info:', error);
  }
}
