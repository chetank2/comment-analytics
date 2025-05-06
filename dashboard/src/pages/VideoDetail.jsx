import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const VideoDetail = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    sentiment: '',
    tags: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        // Fetch video details
        const videoResponse = await axios.get(`http://localhost:3000/api/videos/${videoId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setVideo(videoResponse.data);
        
        // Fetch comments with filters
        await fetchComments(1);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching video data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [videoId]);

  const fetchComments = async (page = 1) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const params = {
        page,
        limit: pagination.limit,
        ...filters
      };
      
      const response = await axios.get(`http://localhost:3000/api/videos/${videoId}/comments`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params
      });
      
      setComments(response.data.comments);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const applyFilters = () => {
    fetchComments(1);
  };

  const resetFilters = () => {
    setFilters({
      sentiment: '',
      tags: '',
      search: ''
    });
    fetchComments(1);
  };

  const handlePageChange = (newPage) => {
    fetchComments(newPage);
  };

  const exportComments = () => {
    if (!comments.length) return;
    
    // Create CSV content
    const headers = ['Author', 'Comment', 'Timestamp', 'Likes', 'Sentiment', 'Tags'];
    const csvContent = [
      headers.join(','),
      ...comments.map(comment => [
        `"${comment.author}"`,
        `"${comment.text.replace(/"/g, '""')}"`,
        `"${comment.timestamp}"`,
        comment.likeCount,
        comment.analysis.sentiment,
        `"${comment.analysis.tags.join(', ')}"`
      ].join(','))
    ].join('\\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${video.title}_comments.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">Video not found</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const sentimentData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: [
          video.stats.sentiment.positive,
          video.stats.sentiment.neutral,
          video.stats.sentiment.negative
        ],
        backgroundColor: ['#10B981', '#6B7280', '#EF4444'],
        borderWidth: 1
      }
    ]
  };

  const categoriesData = {
    labels: ['Questions', 'Praise', 'Suggestions', 'Complaints', 'Spam'],
    datasets: [
      {
        label: 'Comment Categories',
        data: [
          video.stats.categories.questions,
          video.stats.categories.praise,
          video.stats.categories.suggestions,
          video.stats.categories.complaints,
          video.stats.categories.spam
        ],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6B7280']
      }
    ]
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Video Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full md:w-48 h-28 object-cover rounded mb-4 md:mb-0 md:mr-6"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{video.title}</h1>
            <p className="text-gray-600 mb-2">{video.channelName}</p>
            <div className="flex items-center text-sm text-gray-500">
              <span>{video.commentCount} comments analyzed</span>
              <span className="mx-2">•</span>
              <span>{new Date(video.createdAt).toLocaleDateString()}</span>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 text-blue-600 hover:text-blue-500"
              >
                View on YouTube
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'comments'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Comments
            </button>
            <button
              onClick={() => setActiveTab('ideas')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'ideas'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Content Ideas
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sentiment Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Sentiment Analysis</h2>
            <div className="h-64">
              <Pie data={sentimentData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          {/* Categories Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Comment Categories</h2>
            <div className="h-64">
              <Bar
                data={categoriesData}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Keywords */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Top Keywords</h2>
            <div className="flex flex-wrap gap-2">
              {video.stats.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {keyword.word}
                  <span className="ml-1 text-blue-600">({keyword.count})</span>
                </span>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Languages</h2>
            <div className="space-y-2">
              {Object.entries(video.stats.languages).map(([lang, count]) => (
                <div key={lang} className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 w-16">{lang}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2.5 mx-2">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${(count / video.commentCount) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'comments' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search comments..."
                />
              </div>
              <div>
                <label htmlFor="sentiment" className="block text-sm font-medium text-gray-700 mb-1">
                  Sentiment
                </label>
                <select
                  id="sentiment"
                  name="sentiment"
                  value={filters.sentiment}
                  onChange={handleFilterChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">All</option>
                  <option value="positive">Positive</option>
                  <option value="neutral">Neutral</option>
                  <option value="negative">Negative</option>
                </select>
              </div>
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="tags"
                  name="tags"
                  value={filters.tags}
                  onChange={handleFilterChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">All</option>
                  <option value="question">Questions</option>
                  <option value="praise">Praise</option>
                  <option value="suggestion">Suggestions</option>
                  <option value="complaint">Complaints</option>
                  <option value="spam">Spam</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={applyFilters}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Apply
                </button>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Reset
                </button>
                <button
                  onClick={exportComments}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="divide-y divide-gray-200">
            {comments.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No comments found matching your filters</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="p-6">
                  <div className="flex">
                    <div className="mr-4 flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        {comment.author.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {comment.author}
                        {comment.isReply && (
                          <span className="ml-2 text-xs text-gray-500">(reply)</span>
                        )}
                      </h3>
                      <div className="mt-1 text-sm text-gray-700">{comment.text}</div>
                      <div className="mt-2 text-xs text-gray-500 flex items-center">
                        <span>{comment.timestamp}</span>
                        <span className="mx-2">•</span>
                        <span>{comment.likeCount} likes</span>
                        <div className="ml-4 flex space-x-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              comment.analysis.sentiment === 'positive'
                                ? 'bg-green-100 text-green-800'
                                : comment.analysis.sentiment === 'negative'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {comment.analysis.sentiment}
                          </span>
                          {comment.analysis.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    pagination.page === 1
                      ? 'text-gray-300 bg-gray-50'
                      : 'text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    pagination.page === pagination.pages
                      ? 'text-gray-300 bg-gray-50'
                      : 'text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        pagination.page === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {[...Array(pagination.pages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pagination.page === i + 1
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        pagination.page === pagination.pages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'ideas' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">AI-Generated Content Ideas</h2>
            <p className="text-sm text-gray-500">Based on your audience's comments and questions</p>
          </div>
          
          {!video.contentIdeas || video.contentIdeas.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">No content ideas generated yet</p>
              <p className="text-sm text-gray-600">
                This feature is available in the Pro plan
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {video.contentIdeas.map((idea, index) => (
                <div key={index} className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{idea.idea}</h3>
                  <p className="text-sm text-gray-500 mb-2">{idea.source}</p>
                  <div className="flex items-center">
                    <div className="text-xs text-gray-500 mr-2">Relevance:</div>
                    <div className="w-24 bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${idea.relevance * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 ml-2">
                      {Math.round(idea.relevance * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoDetail;
