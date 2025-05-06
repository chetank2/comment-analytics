**Product Requirement Document (PRD)**

**Product Name:** CreatorComment Compass (MVP)
**Product Type:** Browser Extension (Chrome) with Backend API
**Target Users:** Online creators/influencers active on YouTube
**Purpose:** Help creators categorize and analyze their video comments using AI to plan better content

---

### 1. **Goal of the MVP**

To build a lightweight, easy-to-use browser extension that lets creators extract comments from their YouTube videos, automatically categorize them (sentiment, question, praise, feedback, spam, suggestion), and view them in a web dashboard for content planning.

---

### 2. **User Personas**

1. **Solo Creator (YouTube)**

   * Creates 1–2 videos per week
   * Wants to understand what their audience is asking/saying
   * Not very technical
2. **Social Media Manager (Agency)**

   * Handles 3–5 YouTube channels
   * Needs reports or dashboards

---

### 3. **Key MVP Features**

#### A. **Browser Extension UI**

* Platform: Chrome
* **Extension Popup UI**

  * Login with Google (OAuth2) to authenticate and link YouTube channel
  * Button to "Analyze This Video" when viewing a YouTube video page
  * Dropdown to select previous videos from the channel
  * Button to open the web dashboard ("View Insights")

#### B. **Comment Extraction Module**

* When user clicks "Analyze This Video":

  * Extension scrolls and scrapes all comments & replies (up to a limit, e.g., 1,000 per video)
  * Parses usernames, timestamps, comment text, and like count
  * Sends scraped data to backend API via HTTPS

#### C. **Backend API (for AI analysis)**

* REST API hosted with authentication
* Receives list of comments per video
* **NLP Tasks:**

  * Language detection (auto-detect Hindi, English, etc.)
  * Sentiment analysis (positive, neutral, negative)
  * Tagging:

    * Question (e.g., ends with ?)
    * Praise
    * Suggestion
    * Complaint
    * Spam or irrelevant
  * Keyword extraction (topics)
* Stores video-comment-level data in database (MongoDB/PostgreSQL)

#### D. **Web Dashboard**

* Authentication (same as extension login)
* Displays list of analyzed videos with thumbnail and comment count
* **Video Detail View:**

  * Pie chart of sentiment categories
  * Tag filters (e.g., show only questions)
  * Keyword cloud
  * Table view of all comments with tags and export option (CSV)
  * AI-suggested content ideas (generated using common questions/suggestions)

#### E. **Monetization Model (MVP)**

* Freemium:

  * Free plan: Analyze up to 3 videos per month
  * Pro plan: Unlimited analysis + export + idea generation
* Pricing Suggestion:

  * \$9/month (individual)
  * \$25/month (agency – up to 5 channels)

---

### 4. **Tech Stack**

* **Extension:** JavaScript + Manifest V3
* **Frontend (Dashboard):** React.js + TailwindCSS
* **Backend:** Node.js + Express
* **Database:** MongoDB (or PostgreSQL)
* **AI/NLP:** Python (FastAPI) with HuggingFace transformers / OpenAI API for idea suggestions

---

### 5. **User Flow**

1. User installs extension → logs in with Google
2. Visits their YouTube video → clicks "Analyze This Video"
3. Extension scrapes comments → sends to backend
4. Backend returns analysis → stored & shown in dashboard
5. User clicks "View Insights" → opens dashboard → reviews categorized comments and content ideas

---

### 6. **Security & Privacy**

* Only public comment data scraped
* OAuth2 used for Google login
* No personal user data stored without consent
* Users can delete analyzed video data from dashboard

---

### 7. **Milestone Timeline**

**Week 1–2:** Extension popup + YouTube comment scraping
**Week 3:** Backend API for comment intake and categorization
**Week 4:** Basic dashboard to view analyzed comments
**Week 5:** AI integration for tagging and sentiment
**Week 6:** AI content ideas + Freemium login flow

---

### 8. **Future Scope (Post-MVP)**

* Instagram and TikTok comment support
* Indian language sentiment fine-tuning (Hindi, Tamil, etc.)
* Automated weekly summary reports
* Mobile app (React Native)
* Creator team collaboration (invite editors/managers)

---

### 9. **KPIs to Track**

* # of videos analyzed
* # of comments processed
* % of users using suggestions
* Conversion to Pro plan

---

### 10. **Appendix**

* Sample comment categories:

  * "Plz make a part 2" → Suggestion
  * "Why is this not working for me?" → Question
  * "Great job bro!" → Praise
  * "This is trash" → Negative
  * "Check my channel!!" → Spam
