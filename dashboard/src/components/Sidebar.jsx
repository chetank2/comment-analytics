import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Sidebar = () => {
  const { currentUser } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:3000/api/videos', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setVideos(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching videos:', error);
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen">
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Your Videos</h2>
        
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-gray-400 text-sm py-4">
            No videos analyzed yet. Use the Chrome extension to analyze your YouTube videos.
          </div>
        ) : (
          <div className="space-y-2">
            {videos.map((video) => (
              <Link
                key={video.videoId}
                to={`/video/${video.videoId}`}
                className={`block p-2 rounded-md hover:bg-gray-700 transition ${
                  location.pathname === `/video/${video.videoId}` ? 'bg-gray-700' : ''
                }`}
              >
                <div className="flex items-center">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-10 h-6 object-cover rounded mr-2"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{video.title}</p>
                    <p className="text-xs text-gray-400">{video.commentCount} comments</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-700 p-4">
        <div className="text-sm text-gray-400 mb-2">
          {currentUser?.subscription === 'free' ? (
            <div>
              <p>Free Plan</p>
              <p className="text-xs">
                {currentUser?.usageStats?.videosAnalyzed || 0}/3 videos this month
              </p>
            </div>
          ) : (
            <div>
              <p>Pro Plan</p>
              <p className="text-xs">Unlimited videos</p>
            </div>
          )}
        </div>
        
        {currentUser?.subscription === 'free' && (
          <Link
            to="/upgrade"
            className="block w-full text-center py-2 px-4 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
          >
            Upgrade to Pro
          </Link>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
