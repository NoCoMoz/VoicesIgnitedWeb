import React, { useState, useEffect, useCallback, useMemo } from 'react';
import '../src/styles/components/bluesky-feed.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt, faSpinner } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

interface BlueSkyPost {
  id: string;
  text: string;
  author: {
    displayName: string;
    handle: string;
    avatar?: string;
  };
  createdAt: string;
  url: string;
  image?: string;
  location?: string;
}

interface BlueSkyFeedProps {
  postLimit?: number;
  title?: string;
}

const BlueSkyFeed: React.FC<BlueSkyFeedProps> = ({ 
  postLimit = 7,
  title = "Latest from BlueSky"
}) => {
  const [posts, setPosts] = useState<BlueSkyPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  
  // Format date to be more readable
  const formatDate = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(date);
    } catch (err) {
      console.error('Error formatting date:', err);
      return dateString; // Fallback to original string
    }
  }, []);

  // Fetch BlueSky posts
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching BlueSky posts (attempt ${retryCount + 1})`);
      
      const response = await axios.get('/api/bluesky');
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format from BlueSky API');
      }
      
      console.log('BlueSky posts fetched successfully:', response.data.length);
      
      const limitedPosts = response.data.slice(0, postLimit);
      setPosts(limitedPosts);
    } catch (err) {
      console.error('Error fetching BlueSky posts:', err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [postLimit, retryCount]);

  // Retry mechanism for failed requests
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts();
    
    return () => {
      // Cleanup if needed
    };
  }, [fetchPosts]);

  // Memoize the post elements to prevent unnecessary re-renders
  const postElements = useMemo(() => {
    return posts.map((post, index) => (
      <div key={post.id} className="bluesky-feed__post">
        <div className="bluesky-feed__post-header">
          <span className="bluesky-feed__post-org">{post.author.displayName}</span>
          <span className="bluesky-feed__post-handle">@{post.author.handle}</span>
        </div>
        <div className="bluesky-feed__post-date">{formatDate(post.createdAt)}</div>
        <div className="bluesky-feed__post-content">{post.text}</div>
        <a 
          href={post.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="bluesky-feed__post-link"
          aria-label={`View on BlueSky: ${post.text.substring(0, 30)}...`}
        >
          View on BlueSky <FontAwesomeIcon icon={faExternalLinkAlt} />
        </a>
        {index < posts.length - 1 && <div className="bluesky-feed__divider"></div>}
      </div>
    ));
  }, [posts, formatDate]);

  return (
    <div className="bluesky-feed" style={{ backgroundColor: 'purple' }}>
      <h2 className="bluesky-feed__title">{title}</h2>
      
      {loading && (
        <div className="bluesky-feed__loading" aria-live="polite">
          <FontAwesomeIcon icon={faSpinner} spin />
        </div>
      )}
      
      {error && (
        <div className="bluesky-feed__error" aria-live="assertive">
          <p>{error}</p>
          <button 
            onClick={handleRetry} 
            className="bluesky-feed__retry-button"
            aria-label="Retry loading posts"
          >
            Try Again
          </button>
        </div>
      )}
      
      {!loading && !error && posts.length === 0 && (
        <div className="bluesky-feed__empty">
          <p>No posts available at this time.</p>
        </div>
      )}
      
      {!loading && !error && posts.length > 0 && (
        <div className="bluesky-feed__posts">
          {postElements}
        </div>
      )}
    </div>
  );
};

export default BlueSkyFeed;