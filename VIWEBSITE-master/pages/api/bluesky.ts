import { NextApiRequest, NextApiResponse } from 'next';
import { BskyAgent, AppBskyFeedDefs, RichText } from '@atproto/api';

// Define interfaces for type safety
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
}

interface BlueSkyResponse {
  posts: BlueSkyPost[];
  cursor: string | null;
  hasMore: boolean;
}

interface BlueSkyError {
  error: string;
  details: string;
}

// Type definitions for BlueSky embeds
interface EmbedImage {
  $type: string;
  fullsize: string;
  thumb?: string;
  alt?: string;
}

interface ImagesEmbed {
  $type: string;
  images: EmbedImage[];
}

interface MediaEmbed {
  $type: string;
  images: EmbedImage[];
}

type PostEmbed = ImagesEmbed | MediaEmbed;

// Configure BlueSky API with proper error handling
const agent = new BskyAgent({
  service: 'https://bsky.social'
});

/**
 * Formats a Bluesky handle to ensure it has the correct domain
 * Handles various input formats:
 * - Plain username (e.g., "voicesignited")
 * - With @ symbol (e.g., "@voicesignited")
 * - With domain (e.g., "voicesignited.bsky.social")
 * - With @ and domain (e.g., "@voicesignited.bsky.social")
 */
const formatBskyHandle = (handle: string): string => {
  try {
    // Remove @ prefix if present
    const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle;
    
    // If already has a domain, return as is
    if (cleanHandle.includes('.')) {
      return cleanHandle;
    }
    
    // Add .bsky.social domain
    return `${cleanHandle}.bsky.social`;
  } catch (error) {
    console.error('Error formatting handle:', error);
    return handle; // Return original handle if formatting fails
  }
};

// Get BlueSky credentials with proper validation
const rawUsername = process.env.BLUESKY_USERNAME || '';
const BLUESKY_USERNAME = formatBskyHandle(rawUsername);
const BLUESKY_APP_PASSWORD = process.env.BLUESKY_APP_PASSWORD;

// Validate required credentials
if (!BLUESKY_USERNAME || !BLUESKY_APP_PASSWORD) {
  console.error('Missing required BlueSky credentials');
}

/**
 * Type guard to check if an embed is an ImagesEmbed
 */
function isImagesEmbed(embed: PostEmbed): embed is ImagesEmbed {
  return embed.$type === 'app.bsky.embed.images';
}

/**
 * Type guard to check if an embed is a MediaEmbed
 */
function isMediaEmbed(embed: PostEmbed): embed is MediaEmbed {
  return embed.$type === 'app.bsky.embed.media';
}

/**
 * Safely extracts the post ID from a URI
 */
function extractPostId(uri: string): string | null {
  try {
    const parts = uri.split('/');
    const postId = parts[parts.length - 1];
    return postId && postId.length > 0 ? postId : null;
  } catch (error) {
    console.error('Error extracting post ID:', error);
    return null;
  }
}

/**
 * Safely gets the first image from a post embed
 */
function getFirstImage(embed: PostEmbed | undefined): string | undefined {
  try {
    if (!embed) return undefined;

    if (isImagesEmbed(embed) && embed.images.length > 0) {
      return embed.images[0].fullsize;
    } 
    
    if (isMediaEmbed(embed) && embed.images.length > 0) {
      return embed.images[0].fullsize;
    }

    return undefined;
  } catch (error) {
    console.error('Error getting first image:', error);
    return undefined;
  }
}

/**
 * Sanitizes text content by removing control characters and excessive whitespace
 */
function sanitizeText(text: string): string {
  try {
    // Remove control characters and normalize whitespace
    return text
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  } catch (error) {
    console.error('Error sanitizing text:', error);
    return '';
  }
}

/**
 * Validates a date string
 */
function isValidDate(dateStr: string): boolean {
  try {
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime());
  } catch {
    return false;
  }
}

/**
 * Validates a BlueSky post structure
 * Returns true if the post has all required fields in the correct format
 */
function isValidBlueSkyPost(post: any): boolean {
  try {
    if (!post?.post?.uri || !post?.post?.record || !post?.post?.author) {
      return false;
    }

    const { uri, record, author, indexedAt } = post.post;

    // Validate URI format
    if (typeof uri !== 'string' || !uri.includes('/')) {
      return false;
    }

    // Validate record
    if (typeof record !== 'object' || typeof record.text !== 'string') {
      return false;
    }

    // Validate author
    if (typeof author !== 'object' || 
        typeof author.handle !== 'string' || 
        !author.handle.includes('.')) {
      return false;
    }

    // Validate date
    if (!indexedAt || !isValidDate(indexedAt)) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating BlueSky post:', error);
    return false;
  }
}

/**
 * Safely extracts and validates post data from the API response
 */
function extractPostData(post: AppBskyFeedDefs.FeedViewPost): AppBskyFeedDefs.FeedViewPost | null {
  try {
    // Deep clone to avoid reference issues
    const postData = JSON.parse(JSON.stringify(post));
    
    // Basic structure check
    if (!postData?.post?.record?.text || 
        !postData?.post?.uri || 
        !postData?.post?.author?.handle) {
      return null;
    }

    // Clean and validate text
    const text = sanitizeText(postData.post.record.text);
    if (!text) return null;

    // Update the post with cleaned data
    postData.post.record.text = text;
    
    return postData;
  } catch (error) {
    console.error('Error extracting post data:', error);
    return null;
  }
}

/**
 * Sanitizes and validates a BlueSky API response
 * Returns null if the response is invalid
 */
function sanitizeApiResponse(response: { data?: { feed?: unknown[] } }): AppBskyFeedDefs.FeedViewPost[] | null {
  try {
    if (!response?.data?.feed || !Array.isArray(response.data.feed)) {
      console.warn('Invalid API response structure');
      return null;
    }

    // Process each post
    const validPosts = response.data.feed
      .map((post: AppBskyFeedDefs.FeedViewPost) => extractPostData(post))
      .filter((post): post is AppBskyFeedDefs.FeedViewPost => post !== null);

    if (validPosts.length === 0) {
      console.warn('No valid posts found in API response');
      return null;
    }

    return validPosts;
  } catch (error) {
    console.error('Error sanitizing API response:', error);
    return null;
  }
}

/**
 * Maps BlueSky post format to our app's format with enhanced validation
 */
const mapBlueSkyToAppFormat = (feedViewPosts: AppBskyFeedDefs.FeedViewPost[]): BlueSkyPost[] => {
  try {
    return feedViewPosts
      .map((feedViewPost): BlueSkyPost | null => {
        try {
          const post = feedViewPost.post;
          const record = post.record as { text: string };
          const author = post.author;

          // Extract and validate post ID
          const postId = extractPostId(post.uri);
          if (!postId) {
            console.warn('Invalid post ID:', post.uri);
            return null;
          }

          // Get image if available
          const image = getFirstImage(post.embed as PostEmbed | undefined);

          // Ensure we have valid text
          if (!record.text || typeof record.text !== 'string') {
            console.warn('Invalid post text');
            return null;
          }

          // Ensure we have valid author data
          if (!author.handle || typeof author.handle !== 'string') {
            console.warn('Invalid author data');
            return null;
          }

          // Construct URL
          const url = `https://bsky.app/profile/${author.handle}/post/${postId}`;

          // Ensure we have valid date
          if (!post.indexedAt || !isValidDate(post.indexedAt)) {
            console.warn('Invalid post date');
            return null;
          }

          return {
            id: postId,
            text: record.text,
            author: {
              displayName: author.displayName || author.handle,
              handle: author.handle,
              avatar: author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.handle)}&background=0D8ABC&color=fff`,
            },
            createdAt: post.indexedAt,
            url,
            image,
          };
        } catch (error) {
          console.error('Error mapping individual post:', error);
          return null;
        }
      })
      .filter((post): post is BlueSkyPost => post !== null);
  } catch (error) {
    console.error('Error in mapBlueSkyToAppFormat:', error);
    return [];
  }
};

/**
 * Validates the final response before sending to client
 * Returns true if response is valid, false otherwise
 */
function isValidResponse(response: BlueSkyResponse): boolean {
  try {
    // Validate posts array
    if (!Array.isArray(response.posts)) return false;
    
    // Validate each post
    return response.posts.every((post: BlueSkyPost) => {
      return (
        post &&
        typeof post === 'object' &&
        typeof post.id === 'string' &&
        typeof post.text === 'string' &&
        typeof post.url === 'string' &&
        typeof post.createdAt === 'string' &&
        post.author &&
        typeof post.author.handle === 'string'
      );
    });
  } catch (error) {
    console.error('Error validating response:', error);
    return false;
  }
}

/**
 * Creates a FeedViewPost from mock data with proper typing
 */
function createMockFeedViewPost(mockPost: BlueSkyPost): AppBskyFeedDefs.FeedViewPost {
  const post: AppBskyFeedDefs.FeedViewPost = {
    post: {
      uri: `at://mock/${mockPost.id}`,
      cid: `mock-cid-${mockPost.id}`,
      author: {
        did: `did:mock:${mockPost.author.handle}`,
        handle: mockPost.author.handle,
        displayName: mockPost.author.displayName,
        avatar: mockPost.author.avatar,
      },
      record: {
        text: mockPost.text,
        $type: 'app.bsky.feed.post',
        createdAt: mockPost.createdAt,
      },
      indexedAt: mockPost.createdAt,
      embed: mockPost.image ? {
        $type: 'app.bsky.embed.images#view',
        images: [{
          thumb: mockPost.image,
          fullsize: mockPost.image,
          alt: 'Post image',
        }]
      } : undefined,
    },
    reply: undefined,
    reason: undefined
  };
  return post;
}

/**
 * Provides mock BlueSky posts for testing and fallback purposes.
 * This ensures the UI has data to display even when the actual BlueSky API
 * is unavailable or returns no results.
 */
function getMockPosts(): AppBskyFeedDefs.FeedViewPost[] {
  const mockBlueSkyPosts: BlueSkyPost[] = [
    {
      id: 'mock1',
      text: 'Excited to announce our latest community initiative! We\'re partnering with local organizations to expand our reach and impact. #VoicesIgnited #CommunityFirst',
      author: {
        displayName: 'Voices Ignited',
        handle: 'voicesignited.bsky.social',
        avatar: 'https://ui-avatars.com/api/?name=VI&background=0D8ABC&color=fff'
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      url: 'https://bsky.app/profile/voicesignited.bsky.social/post/mock1',
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
      id: 'mock2',
      text: 'Join us this Saturday for our virtual workshop on effective community organizing strategies! Registration link in bio. #GrassrootsAction',
      author: {
        displayName: 'Voices Ignited',
        handle: 'voicesignited.bsky.social',
        avatar: 'https://ui-avatars.com/api/?name=VI&background=0D8ABC&color=fff'
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      url: 'https://bsky.app/profile/voicesignited.bsky.social/post/mock2',
      image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
      id: 'mock3',
      text: 'Check out our new resource hub for community organizers! We\'ve compiled guides, templates, and best practices to help you amplify your impact. #ResourcesForChange',
      author: {
        displayName: 'Voices Ignited',
        handle: 'voicesignited.bsky.social',
        avatar: 'https://ui-avatars.com/api/?name=VI&background=0D8ABC&color=fff'
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      url: 'https://bsky.app/profile/voicesignited.bsky.social/post/mock3',
      image: 'https://images.unsplash.com/photo-1589561253898-768105ca91a8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    }
  ];

  return mockBlueSkyPosts.map(createMockFeedViewPost);
}

/**
 * Creates a formatted response object with mock data for the BlueSky feed.
 * Simulates pagination by setting cursor and hasMore values appropriately.
 * 
 * @param limit - Number of posts to return
 * @returns Object with posts, cursor, and hasMore properties
 */
function getSimpleMockResponse(limit: number): BlueSkyResponse {
  const mockFeedViewPosts = getMockPosts();
  const limitedPosts = mockFeedViewPosts.slice(0, limit);
  const formattedPosts = mapBlueSkyToAppFormat(limitedPosts);
  
  // Log the response for debugging
  console.log('Returning simplified mock data with', formattedPosts.length, 'posts');
  
  return {
    posts: formattedPosts,
    cursor: formattedPosts.length === limit ? 'mock-cursor' : null,
    hasMore: formattedPosts.length === limit
  };
}

/**
 * Retries an async function with exponential backoff
 * @param fn - Function to retry
 * @param retries - Number of retries
 * @param delay - Initial delay in ms
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    
    console.warn(`Retrying after ${delay}ms...`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<BlueSkyResponse | BlueSkyError>
) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ 
        error: 'Method not allowed',
        details: 'Only GET requests are supported'
      });
    }

    // Validate query parameters
    const { 
      limit = '10',
      actor,
      cursor = undefined
    } = req.query;

    // Validate limit
    const parsedLimit = parseInt(limit as string, 10);
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      return res.status(400).json({
        error: 'Invalid limit parameter',
        details: 'Limit must be a number between 1 and 100'
      });
    }

    // Validate and format the actor handle
    if (actor && typeof actor !== 'string') {
      return res.status(400).json({
        error: 'Invalid actor parameter',
        details: 'Actor must be a string'
      });
    }

    const formattedActor = actor ? formatBskyHandle(actor as string) : BLUESKY_USERNAME;
    console.log('Processing BlueSky API request:', { 
      limit: parsedLimit, 
      rawActor: actor,
      formattedActor,
      loginUsername: BLUESKY_USERNAME,
      cursor
    });

    // Validate credentials following security best practices
    if (!BLUESKY_USERNAME || !BLUESKY_APP_PASSWORD) {
      console.error('Missing BlueSky credentials');
      return res.status(500).json({ 
        error: 'BlueSky API configuration error',
        details: 'Missing required credentials'
      });
    }

    // Login to BlueSky with retry mechanism
    try {
      await retryWithBackoff(async () => {
        await agent.login({
          identifier: BLUESKY_USERNAME,
          password: BLUESKY_APP_PASSWORD
        });
      });
      console.log('Successfully authenticated with BlueSky');
    } catch (error) {
      const loginError = error as Error;
      console.error('BlueSky authentication failed after retries:', {
        message: loginError.message,
        username: BLUESKY_USERNAME,
        error
      });
      return res.status(401).json({ 
        error: 'BlueSky authentication failed',
        details: loginError.message
      });
    }

    // Fetch posts with retry mechanism
    try {
      const timeline = await retryWithBackoff(async () => {
        const result = await agent.getAuthorFeed({
          actor: formattedActor,
          limit: parsedLimit,
          cursor: cursor as string | undefined
        });

        // Sanitize and validate API response
        const sanitizedFeed = sanitizeApiResponse(result);
        if (!sanitizedFeed) {
          console.warn('Invalid or malformed API response, falling back to mock data');
          return {
            success: true,
            data: {
              feed: getMockPosts(),
              cursor: 'mock-cursor'
            }
          };
        }

        return {
          success: true,
          data: {
            feed: sanitizedFeed,
            cursor: result.data?.cursor
          }
        };
      });

      // Map and validate posts
      const formattedPosts = mapBlueSkyToAppFormat(timeline.data.feed);
      
      // Log success with post details for debugging
      console.log('Successfully processed posts:', {
        count: formattedPosts.length,
        actor: formattedActor,
        postIds: formattedPosts.map(p => p.id),
        cursor: timeline.data.cursor
      });

      // If no valid posts after formatting, return mock data
      if (formattedPosts.length === 0) {
        console.warn('No valid posts after formatting, falling back to mock data');
        return res.status(200).json(getSimpleMockResponse(parsedLimit));
      }

      // Construct response
      const response: BlueSkyResponse = {
        posts: formattedPosts,
        cursor: timeline.data.cursor || null,
        hasMore: !!timeline.data.cursor
      };

      // Final validation before sending
      if (!isValidResponse(response)) {
        console.warn('Final response validation failed, falling back to mock data');
        return res.status(200).json(getSimpleMockResponse(parsedLimit));
      }

      return res.status(200).json(response);
    } catch (error) {
      const fetchError = error as Error;
      console.error('Error fetching BlueSky posts after retries:', {
        message: fetchError.message,
        actor: formattedActor,
        error: fetchError
      });
      
      // Fallback to mock data on error
      console.warn('Falling back to mock data due to fetch error');
      return res.status(200).json(getSimpleMockResponse(parsedLimit));
    }
  } catch (error) {
    const serverError = error as Error;
    console.error('Unexpected error in BlueSky API handler:', serverError);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: serverError.message
    });
  }
}
