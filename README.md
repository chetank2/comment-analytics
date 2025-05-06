# CreatorComment Compass

CreatorComment Compass is a tool that helps YouTube creators analyze and categorize comments on their videos using AI. This project consists of a Chrome extension, a backend API, and a web dashboard.

## Features

- **Comment Extraction**: Automatically scrape comments from YouTube videos
- **AI Analysis**: Categorize comments by sentiment, questions, praise, feedback, etc.
- **Dashboard**: View insights and analytics about your video comments
- **Content Ideas**: Get AI-generated content ideas based on audience feedback

## Project Structure

The project is organized into the following components:

- **extension/**: Chrome extension for scraping YouTube comments
- **backend/**: Node.js + Express API for processing comments
- **dashboard/**: React.js frontend for viewing analytics
- **nlp-service/**: Python FastAPI service for AI analysis

## Getting Started

### Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- MongoDB

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/chetank2/comment-analytics.git
   cd comment-analytics
   ```

2. Install dependencies for each component:

   **Backend:**
   ```
   cd backend
   npm install
   ```

   **Dashboard:**
   ```
   cd dashboard
   npm install
   ```

   **NLP Service:**
   ```
   cd nlp-service
   pip install -r requirements.txt
   ```

   **Extension:**
   ```
   cd extension
   ```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```

2. Start the dashboard:
   ```
   cd dashboard
   npm run dev
   ```

3. Start the NLP service:
   ```
   cd nlp-service
   uvicorn main:app --reload
   ```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `extension` folder

## Usage

1. Sign in to the extension using your Google account
2. Navigate to one of your YouTube videos
3. Click the extension icon and select "Analyze This Video"
4. View the results in the dashboard

## License

This project is licensed under the MIT License - see the LICENSE file for details.
