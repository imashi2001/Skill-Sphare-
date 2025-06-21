import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Trophy, BarChart2, Info, Eye, ThumbsUp, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import avatarPlaceholder from '../../assets/avatar.png'; // Ensure this path is correct

const backgroundStyle = {
  background: 'radial-gradient(circle at top left, #e0f2fe 10%, #f3e8ff 60%, #e6f7f0 100%)'
};

const categoryColors = {
    Technology: 'bg-blue-100 text-blue-700',
    Science: 'bg-emerald-100 text-emerald-700',
    Art: 'bg-purple-100 text-purple-700',
    Music: 'bg-pink-100 text-pink-700',
    Sports: 'bg-orange-100 text-orange-700',
    Education: 'bg-amber-100 text-amber-700',
    Other: 'bg-slate-100 text-slate-700',
    default: 'bg-gray-100 text-gray-700'
};

const LeaderboardPostItem = ({ post, rank }) => {
  const navigate = useNavigate();
  const authorImage = post.authorProfileImage ? `http://localhost:8080/api/media/files/${post.authorProfileImage.startsWith('/') ? post.authorProfileImage.substring(1) : post.authorProfileImage}` : avatarPlaceholder;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      onClick={() => navigate(`/posts/view/${post.postId}`)}
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-5 mb-6 transition-all hover:shadow-2xl cursor-pointer flex gap-4 items-start"
    >
      <div className="flex flex-col items-center justify-center text-center pr-4 border-r border-gray-200">
        <Trophy size={28} className={`mb-1 ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-400' : rank === 3 ? 'text-orange-400' : 'text-blue-500'}`} />
        <span className={`text-2xl font-bold ${rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-gray-500' : rank === 3 ? 'text-orange-500' : 'text-blue-600'}`}>#{rank}</span>
        <span className="text-xs text-gray-500 mt-1">Score: {post.rankScore.toFixed(2)}</span>
      </div>

      <div className="flex-grow">
        <div className="flex items-center mb-2">
          <img src={authorImage} alt={post.authorName || 'Author'} className="w-8 h-8 rounded-full mr-2 object-cover" />
          <div>
            <p className="text-xs text-gray-600">
              By <span className="font-medium text-gray-800">{post.authorName || 'Unknown User'}</span>
            </p>
            <p className="text-xs text-gray-500">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div> 
        <h3 className="text-lg font-semibold text-gray-800 mb-1 hover:text-blue-600 transition-colors">{post.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{post.content.replace(/<[^>]+>/g, '')}</p>
        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
            <span className={`inline-block px-2 py-0.5 font-medium rounded-full ${categoryColors[post.category] || categoryColors.default}`}>
                {post.category}
            </span>
            <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><Eye size={14}/> {post.views || 0}</span>
                {/* Assuming you might add like/comment counts to PostDTO for leaderboards later */}
                {/* <span className="flex items-center gap-1"><ThumbsUp size={14}/> {post.likeCount || 0}</span> */}
                {/* <span className="flex items-center gap-1"><MessageCircle size={14}/> {post.commentCount || 0}</span> */}
            </div>
        </div>
      </div>
    </motion.div>
  );
};

function Leaderboard() {
  const [topPosts, setTopPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [timeFilter, setTimeFilter] = useState('all-time'); // For future filter implementation

  const fetchTopPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token'); // Assuming leaderboard might be protected or personalized in future
      const response = await axios.get('http://localhost:8080/api/posts/top-ranked?limit=10', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setTopPosts(response.data);
    } catch (err) {
      setError('Failed to fetch top posts. Please try again later.');
      console.error("Fetch top posts error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopPosts();
  }, [fetchTopPosts]);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={backgroundStyle}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-800 flex items-center justify-center">
            <BarChart2 size={38} className="mr-3 text-blue-600" />
            Community Leaderboard
          </h1>
          <p className="text-lg text-gray-600 mt-2">Discover the most popular and engaging posts in our community!</p>
        </header>

        {/* Optional: Filters for timeframes/categories can go here */}
        {/* <div className="mb-6 flex justify-center gap-2"> ...filter buttons... </div> */}

        <div className="flex flex-col lg:flex-row gap-8">
          <main className="lg:w-2/3 w-full">
            {loading && <p className="text-center text-gray-600 py-10">Loading top posts...</p>}
            {error && <p className="text-center text-red-500 py-10">{error}</p>}
            
            {!loading && !error && (
              <div>
                {topPosts.length > 0 ? (
                  topPosts.map((post, index) => (
                    <LeaderboardPostItem
                      key={post.postId}
                      post={post}
                      rank={index + 1}
                    />
                  ))
                ) : (
                  <div className="text-center py-16 bg-white rounded-xl shadow-lg">
                    <Info size={48} className="mx-auto mb-3 text-gray-400"/>
                    <p className="text-xl text-gray-500">No posts to display on the leaderboard yet.</p>
                    <p className="text-sm text-gray-400 mt-1">Check back soon for top content!</p>
                  </div>
                )}
              </div>
            )}
          </main>

          <aside className="lg:w-1/3 w-full">
            <div className="bg-white p-6 rounded-xl shadow-lg sticky top-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Info size={22} className="mr-2 text-blue-500" /> How Ranking Works
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                Posts are ranked based on a combination of factors designed to highlight engaging and popular content. This includes:
              </p>
              <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside mb-4">
                <li><span className="font-medium">Views:</span> More views contribute to a higher score.</li>
                <li><span className="font-medium">Reactions:</span> Likes, loves, and other reactions boost ranking.</li>
                <li><span className="font-medium">Comments:</span> Active discussions and more comments improve score.</li>
                <li><span className="font-medium">Recency:</span> Newer posts get a slight edge to keep content fresh.</li>
              </ul>
              <p className="text-sm text-gray-500 italic">
                The ranking scores are updated regularly to reflect the latest activity.
              </p>
              
              <div className="mt-6 border-t pt-5">
                 <h3 className="text-lg font-semibold text-gray-700 mb-3">Your Contribution Matters!</h3>
                 <p className="text-sm text-gray-600">
                    Share your knowledge, engage with others, and you might see your post here! 
                 </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard; 