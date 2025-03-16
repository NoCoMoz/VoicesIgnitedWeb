import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import '@/styles/components/bluesky-feed.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt, faSpinner, faChevronLeft, faChevronRight, faLocationDot, faHistory } from '@fortawesome/free-solid-svg-icons';
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

interface BlueSkyResponse {
  posts: BlueSkyPost[];
  cursor: string | null;
  hasMore: boolean;
}

interface BlueSkyFeedProps {
  postLimit?: number;
  feedActor?: string;
  title?: string;
}

const BlueSkyFeed: React.FC<BlueSkyFeedProps> = ({ 
  postLimit = 5, 
  feedActor = 'voicesignited.bsky.social',
  title = 'Latest from Voices Ignited'
}) => {
  const [posts, setPosts] = useState<BlueSkyPost[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Format date to be more readable
  const formatDate = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    } catch (err: any) {
      console.error('Error formatting date:', err);
      return dateString; // Fallback to original string
    }
  }, []);

  // Fetch BlueSky posts
  const fetchPosts = useCallback(async (loadMore: boolean = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }
      
      // Build the query parameters for the API request
      let url = '/api/bluesky?';
      const params = new URLSearchParams();
      
      if (postLimit) params.append('limit', postLimit.toString());
      if (feedActor) params.append('actor', feedActor);
      
      // Add cursor for pagination if loading more
      if (loadMore && cursor) {
        params.append('cursor', cursor);
      }
      
      // Complete URL with parameters
      url += params.toString();
      
      try {
        const response = await axios.get<BlueSkyResponse>(url, {
          timeout: 10000 // 10 second timeout
        });

        if (!response.data || !response.data.posts || !Array.isArray(response.data.posts)) {
          throw new Error('Invalid response format from BlueSky API');
        }
        
        // Update cursor and hasMore state
        setCursor(response.data.cursor);
        setHasMore(response.data.hasMore);
        
        if (loadMore) {
          // Append new posts to existing ones
          setPosts(prev => [...prev, ...response.data.posts]);
        } else {
          // Replace posts with new ones
          setPosts(response.data.posts);
        }
      } catch (err: any) {
        console.error('Error fetching BlueSky posts:', err);
        
        // Handle specific error types
        if (err.response) {
          const status = err.response.status;
          const data = err.response.data;
          
          if (status === 401) {
            setError('Authentication with BlueSky failed. Please check credentials.');
          } else if (status === 429) {
            setError('Rate limit exceeded on BlueSky API. Please try again later.');
          } else if (status === 404) {
            setError(`BlueSky user "${feedActor}" not found.`);
          } else if (status === 500) {
            // For 500 errors, show a more user-friendly message
            setError('Unable to load posts at the moment. Using cached data.');
            // Use mock data as fallback
            setPosts([{
              id: 'mock-1',
              text: 'Welcome to Voices Ignited! Stay tuned for updates.',
              author: {
                displayName: 'Voices Ignited',
                handle: 'voicesignited.bsky.social',
                avatar: undefined
              },
              createdAt: new Date().toISOString(),
              url: 'https://bsky.app',
              image: undefined
            }]);
            setHasMore(false);
            setCursor(null);
          } else {
            setError(data.error || 'Failed to load posts. Please try again later.');
          }
        } else if (err.code === 'ECONNABORTED') {
          setError('Request timed out. The server might be experiencing high load.');
        } else {
          setError('Failed to load posts. Please try again later.');
        }
      } finally {
        if (loadMore) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    } catch (err: any) {
      console.error('Error fetching BlueSky posts:', err);
      
      // Handle specific error types
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        if (status === 401) {
          setError('Authentication with BlueSky failed. Please check credentials.');
        } else if (status === 429) {
          setError('Rate limit exceeded on BlueSky API. Please try again later.');
        } else if (status === 404) {
          setError(`BlueSky user "${feedActor}" not found.`);
        } else {
          setError(data.error || 'Failed to load posts. Please try again later.');
        }
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timed out. The server might be experiencing high load.');
      } else {
        setError('Failed to load posts. Please try again later.');
      }
    } finally {
      if (loadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [postLimit, retryCount, feedActor, cursor]);

  // Retry mechanism for failed requests
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setError(null);
    fetchPosts();
  }, [fetchPosts]);

  // Load more posts handler
  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      fetchPosts(true);
    }
  }, [hasMore, loadingMore, fetchPosts]);

  // Scroll the container left or right
  const scrollContainer = useCallback((direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.8; // Scroll 80% of the container width
      
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  }, []);

  // Fetch posts on component mount and when dependencies change
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Handle text truncation for display
  const truncateText = useCallback((text: string, maxLength: number = 280): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }, []);

  // Memoize the post elements to prevent unnecessary re-renders
  const postElements = useMemo(() => {
    return posts.map((post) => (
      <div key={post.id} className="bluesky-feed__post">
        <div className="bluesky-feed__post-header">
          {post.author.avatar && (
            <img 
              src={post.author.avatar} 
              alt={`${post.author.displayName} avatar`} 
              className="bluesky-feed__post-avatar"
              onError={(e) => {
                // Fallback for broken avatar images
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <div className="bluesky-feed__post-author-info">
            <span className="bluesky-feed__post-org">{post.author.displayName}</span>
            <span className="bluesky-feed__post-handle">@{post.author.handle}</span>
          </div>
        </div>
        <div className="bluesky-feed__post-date">
          {formatDate(post.createdAt)}
          {post.location && (
            <span className="bluesky-feed__post-location">
              <FontAwesomeIcon icon={faLocationDot} /> {post.location}
            </span>
          )}
        </div>
        <div className="bluesky-feed__post-content">
          <p>{truncateText(post.text)}</p>
          {post.image && (
            <img 
              src={post.image} 
              alt="Post attachment" 
              className="bluesky-feed__post-image"
              loading="lazy"
            />
          )}
        </div>
        <div className="bluesky-feed__post-footer">
          <a 
            href={post.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bluesky-feed__post-link"
          >
            <FontAwesomeIcon icon={faExternalLinkAlt} /> View on Bluesky
          </a>
        </div>
      </div>
    ));
  }, [posts, formatDate, truncateText]);

  // Render the component
  return (
    <div className="bluesky-feed">
      <div className="bluesky-feed__header">
        <h2>{title}</h2>
        {loading && !loadingMore && (
          <div className="bluesky-feed__loading">
            <FontAwesomeIcon icon={faSpinner} spin /> Loading posts...
          </div>
        )}
      </div>

      {error && (
        <div className="bluesky-feed__error">
          <p>{error}</p>
          <button onClick={handleRetry} className="bluesky-feed__retry-button">
            <FontAwesomeIcon icon={faHistory} /> Retry
          </button>
        </div>
      )}

      <div className="bluesky-feed__posts" ref={scrollContainerRef}>
        {postElements}
      </div>

      <div className="bluesky-feed__navigation">
        <button 
          onClick={() => scrollContainer('left')} 
          className="bluesky-feed__nav-button"
          aria-label="Scroll left"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        
        {hasMore && (
          <button 
            onClick={handleLoadMore} 
            className="bluesky-feed__load-more"
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin /> Loading more...
              </>
            ) : (
              'Load More Posts'
            )}
          </button>
        )}

        <button 
          onClick={() => scrollContainer('right')} 
          className="bluesky-feed__nav-button"
          aria-label="Scroll right"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );
};

export default BlueSkyFeed;