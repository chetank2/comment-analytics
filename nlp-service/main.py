from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from langdetect import detect
from transformers import pipeline
import random

# Download NLTK resources
nltk.download('punkt')
nltk.download('stopwords')

# Initialize FastAPI app
app = FastAPI(title="CreatorComment Compass NLP Service")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize sentiment analysis pipeline
sentiment_analyzer = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")

# Define models
class CommentInput(BaseModel):
    id: str
    author: str
    text: str
    timestamp: Optional[str] = None
    likeCount: Optional[int] = 0
    isReply: Optional[bool] = False
    parentId: Optional[str] = None

class CommentAnalysis(BaseModel):
    language: str
    sentiment: str
    tags: List[str]
    keywords: List[str]
    relevance: float = 0.5

class CommentOutput(BaseModel):
    id: str
    author: str
    text: str
    timestamp: Optional[str] = None
    likeCount: Optional[int] = 0
    isReply: Optional[bool] = False
    parentId: Optional[str] = None
    analysis: CommentAnalysis

class CommentsInput(BaseModel):
    comments: List[CommentInput]

class ContentIdea(BaseModel):
    idea: str
    source: str
    relevance: float

class AnalysisOutput(BaseModel):
    comments: List[CommentOutput]
    contentIdeas: Optional[List[ContentIdea]] = None

# Helper functions
def detect_language(text: str) -> str:
    """Detect the language of the text."""
    try:
        return detect(text)
    except:
        return "en"  # Default to English if detection fails

def analyze_sentiment(text: str) -> str:
    """Analyze the sentiment of the text."""
    try:
        result = sentiment_analyzer(text)[0]
        if result["label"] == "POSITIVE":
            return "positive"
        elif result["label"] == "NEGATIVE":
            return "negative"
        else:
            return "neutral"
    except:
        # If model fails, use simple rule-based approach
        positive_words = ["good", "great", "awesome", "excellent", "love", "like", "best", "amazing"]
        negative_words = ["bad", "terrible", "awful", "worst", "hate", "dislike", "poor", "horrible"]
        
        text_lower = text.lower()
        pos_count = sum(1 for word in positive_words if word in text_lower)
        neg_count = sum(1 for word in negative_words if word in text_lower)
        
        if pos_count > neg_count:
            return "positive"
        elif neg_count > pos_count:
            return "negative"
        else:
            return "neutral"

def extract_tags(text: str) -> List[str]:
    """Extract tags from the comment text."""
    tags = []
    text_lower = text.lower()
    
    # Check for questions
    if "?" in text or any(q in text_lower for q in ["how", "what", "when", "where", "why", "who", "which"]):
        tags.append("question")
    
    # Check for praise
    praise_patterns = [
        r"(great|good|awesome|excellent|amazing|love|best|fantastic) (video|content|job|work)",
        r"(love|like) (your|this) (channel|content|videos)",
        r"(keep|continue) (up|it|the) (good|great) work",
        r"(thank|thanks) (you|for)"
    ]
    if any(re.search(pattern, text_lower) for pattern in praise_patterns):
        tags.append("praise")
    
    # Check for suggestions
    suggestion_patterns = [
        r"(you|please) (should|could|might) (try|make|do|consider)",
        r"(can|would) you (please|) (make|do|try)",
        r"(please|) (make|do) (a|another|more) (video|content) (on|about)",
        r"(would|i'd) (like|love) to see"
    ]
    if any(re.search(pattern, text_lower) for pattern in suggestion_patterns):
        tags.append("suggestion")
    
    # Check for complaints
    complaint_patterns = [
        r"(don't|do not|didn't|did not) (like|work|agree)",
        r"(this is|that was) (bad|terrible|awful|wrong|incorrect)",
        r"(not|isn't|ain't) (good|working|helpful|useful)",
        r"(disappointed|disappointing|waste of time)"
    ]
    if any(re.search(pattern, text_lower) for pattern in complaint_patterns):
        tags.append("complaint")
    
    # Check for spam
    spam_patterns = [
        r"(check|visit|subscribe to) (my|our) (channel|page|profile)",
        r"(follow|add) me",
        r"(click|tap) (the|my) link",
        r"(earn|make) money",
        r"(free|cheap) (followers|subscribers|likes)"
    ]
    if any(re.search(pattern, text_lower) for pattern in spam_patterns):
        tags.append("spam")
    
    return tags

def extract_keywords(text: str, lang: str = "en") -> List[str]:
    """Extract keywords from the comment text."""
    try:
        # Tokenize the text
        tokens = word_tokenize(text.lower())
        
        # Remove stopwords
        stop_words = set(stopwords.words('english'))
        filtered_tokens = [word for word in tokens if word.isalnum() and word not in stop_words and len(word) > 2]
        
        # Return top keywords (up to 5)
        return list(set(filtered_tokens))[:5]
    except:
        # Fallback to simple word extraction
        words = re.findall(r'\b\w+\b', text.lower())
        return list(set([w for w in words if len(w) > 3]))[:5]

def calculate_relevance(comment: CommentInput) -> float:
    """Calculate relevance score based on like count and other factors."""
    base_score = 0.5
    
    # Adjust based on like count
    if comment.likeCount > 100:
        base_score += 0.3
    elif comment.likeCount > 10:
        base_score += 0.1
    
    # Adjust based on comment length
    if len(comment.text) > 200:
        base_score += 0.1
    elif len(comment.text) < 20:
        base_score -= 0.1
    
    # Cap between 0 and 1
    return max(0.0, min(1.0, base_score))

def generate_content_ideas(analyzed_comments: List[CommentOutput]) -> List[ContentIdea]:
    """Generate content ideas based on analyzed comments."""
    # Extract questions for potential content ideas
    questions = [comment for comment in analyzed_comments if "question" in comment.analysis.tags]
    
    # Extract suggestions
    suggestions = [comment for comment in analyzed_comments if "suggestion" in comment.analysis.tags]
    
    # Generate ideas
    ideas = []
    
    # From questions
    for question in sorted(questions, key=lambda x: x.likeCount, reverse=True)[:5]:
        # Clean up the question
        text = question.text.strip()
        if text.endswith('?'):
            # Remove question mark for the idea title
            text = text[:-1]
        
        ideas.append(ContentIdea(
            idea=f"Answer: {text}",
            source=f"Question from {question.author}",
            relevance=min(1.0, 0.5 + (question.likeCount / 100))
        ))
    
    # From suggestions
    for suggestion in sorted(suggestions, key=lambda x: x.likeCount, reverse=True)[:5]:
        ideas.append(ContentIdea(
            idea=suggestion.text,
            source=f"Suggestion from {suggestion.author}",
            relevance=min(1.0, 0.5 + (suggestion.likeCount / 100))
        ))
    
    # Return top 10 ideas
    return sorted(ideas, key=lambda x: x.relevance, reverse=True)[:10]

# API endpoints
@app.get("/")
def read_root():
    return {"message": "CreatorComment Compass NLP Service"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/analyze", response_model=AnalysisOutput)
def analyze_comments(input_data: CommentsInput):
    try:
        analyzed_comments = []
        
        for comment in input_data.comments:
            # Detect language
            language = detect_language(comment.text)
            
            # Analyze sentiment
            sentiment = analyze_sentiment(comment.text)
            
            # Extract tags
            tags = extract_tags(comment.text)
            
            # Extract keywords
            keywords = extract_keywords(comment.text, language)
            
            # Calculate relevance
            relevance = calculate_relevance(comment)
            
            # Create analysis object
            analysis = CommentAnalysis(
                language=language,
                sentiment=sentiment,
                tags=tags,
                keywords=keywords,
                relevance=relevance
            )
            
            # Create output comment
            output_comment = CommentOutput(
                id=comment.id,
                author=comment.author,
                text=comment.text,
                timestamp=comment.timestamp,
                likeCount=comment.likeCount,
                isReply=comment.isReply,
                parentId=comment.parentId,
                analysis=analysis
            )
            
            analyzed_comments.append(output_comment)
        
        # Generate content ideas
        content_ideas = generate_content_ideas(analyzed_comments)
        
        return AnalysisOutput(
            comments=analyzed_comments,
            contentIdeas=content_ideas
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
