import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalComments: 0,
    videosAnalyzed: 0,
    remaining: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        // Fetch videos
        const videosResponse = await axios.get('http://localhost:3000/api/videos', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Fetch usage stats
        const statsResponse = await axios.get('http://localhost:3000/api/user/usage', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setVideos(videosResponse.data);
        setStats(statsResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {currentUser?.name}</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Videos</div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalVideos}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Comments</div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalComments}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Videos This Month</div>
          <div className="text-3xl font-bold text-gray-900">{stats.videosAnalyzed}</div>
          {currentUser?.subscription === 'free' && (
            <div className="text-xs text-gray-500 mt-1">
              {stats.remaining} remaining of 3
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Subscription</div>
          <div className="text-xl font-bold text-gray-900">
            {currentUser?.subscription === 'free' ? 'Free Plan' : 'Pro Plan'}
          </div>
          {currentUser?.subscription === 'free' && (
            <Link to="/upgrade" className="text-sm text-blue-600 hover:text-blue-500 mt-2 inline-block">
              Upgrade to Pro
            </Link>
          )}
        </div>
      </div>
      
      {/* Recent Videos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Videos</h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : videos.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No videos analyzed yet</p>
            <p className="text-sm text-gray-600 mb-4">
              Use the Chrome extension to analyze your YouTube video comments
            </p>
            <a
              href="#"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Extension
            </a>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {videos.map((video) => (
              <Link
                key={video.videoId}
                to={`/video/${video.videoId}`}
                className="block hover:bg-gray-50 transition"
              >
                <div className="px-6 py-4 flex items-center">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-24 h-14 object-cover rounded mr-4"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{video.title}</h3>
                    <p className="text-sm text-gray-500">{video.commentCount} comments</p>
                    <div className="mt-1 flex items-center">
                      <span className="text-xs text-gray-500">
                        {new Date(video.createdAt).toLocaleDateString()}
                      </span>
                      <div className="ml-4 flex space-x-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          {video.stats.sentiment.positive} positive
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          {video.stats.sentiment.negative} negative
                        </span>
                      </div>
                    </div>
                  </div>
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
