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

## Deployment

### Docker Deployment

The application can be deployed using Docker and Docker Compose:

1. Copy the `.env.example` file to `.env` and update the environment variables:
   ```
   cp .env.example .env
   ```

2. Build and start the containers:
   ```
   docker-compose up -d
   ```

3. Access the services:
   - Dashboard: http://localhost:5173
   - Backend API: http://localhost:3000
   - NLP Service: http://localhost:8000

### Manual Deployment

#### Backend

1. Install PM2 globally:
   ```
   npm install -g pm2
   ```

2. Navigate to the backend directory:
   ```
   cd backend
   ```

3. Start the server with PM2:
   ```
   pm2 start server.js --name comment-compass-backend
   ```

#### NLP Service

1. Install Gunicorn:
   ```
   pip install gunicorn
   ```

2. Navigate to the NLP service directory:
   ```
   cd nlp-service
   ```

3. Start the service with Gunicorn:
   ```
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
   ```

#### Dashboard

1. Build the production version:
   ```
   cd dashboard
   npm run build
   ```

2. Serve the build directory using Nginx or another web server.

### Extension Deployment

To package the extension for the Chrome Web Store:

1. Navigate to the extension directory:
   ```
   cd extension
   ```

2. Run the package script:
   ```
   npm run package
   ```

3. Upload the generated `extension.zip` file to the Chrome Web Store Developer Dashboard.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
