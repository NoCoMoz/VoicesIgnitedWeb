import React, { useState, useEffect } from 'react';
import { Cloud } from 'lucide-react';
import _ from 'lodash';
import '@/styles/components/wordcloud.scss';

interface Post {
  text: string;
  url: string;
  source: 'Instagram' | 'Twitter' | 'TikTok' | 'Substack' | 'Bluesky';
}

interface WordPosition {
  text: string;
  count: number;
  source: Post['source'];
  x: number;
  y: number;
  dx: number;
  dy: number;
}

const SocialTextCloud = () => {
  // Test data to use instead of fetching
  const testData: Post[] = [
    { text: "Check out our new product launch today! Super excited to share this with everyone.", url: "#", source: 'Instagram' },
    { text: "Just published a new article about remote work productivity tips and tools.", url: "#", source: 'Substack' },
    { text: "The weather is amazing today! Perfect for outdoor photography sessions.", url: "#", source: 'Instagram' },
    { text: "Thread: Why content creation matters more than ever in 2025. Let me break it down...", url: "#", source: 'Twitter' },
    { text: "Remote work productivity has changed how we think about office spaces forever.", url: "#", source: 'Substack' },
    { text: "Creating digital content requires both technical skills and creative vision.", url: "#", source: 'TikTok' },
    { text: "Photography tips: The golden hour creates perfect lighting conditions for portraits.", url: "#", source: 'Instagram' },
    { text: "Just released my productivity framework for freelancers! Download the free template.", url: "#", source: 'Twitter' },
    { text: "Digital marketing trends to watch this quarter. Engagement is everything!", url: "#", source: 'Substack' },
    { text: "Behind the scenes of today's photoshoot. Love working with this amazing team!", url: "#", source: 'Instagram' },
    { text: "Dance tutorial: Learn this trending choreography step by step!", url: "#", source: 'TikTok' },
    { text: "Marketing strategy depends on understanding your audience deeply.", url: "#", source: 'Twitter' },
    { text: "Cooking tutorial: My grandmother's secret recipe finally revealed!", url: "#", source: 'TikTok' },
    { text: "Design thinking can transform how businesses approach problem solving.", url: "#", source: 'Substack' },
    { text: "Morning routine secrets: How to maximize productivity before 9am.", url: "#", source: 'Twitter' },
    { text: "Exploring decentralized social media and its impact on creator ownership.", url: "#", source: 'Bluesky' },
    { text: "Building in public: Progress update on my latest open source project!", url: "#", source: 'Bluesky' },
    { text: "Thoughts on algorithmic transparency and user control in social platforms.", url: "#", source: 'Bluesky' },
    { text: "Connecting with the Bluesky community has been an amazing experience.", url: "#", source: 'Bluesky' },
    { text: "Just shared my perspective on decentralized identity systems.", url: "#", source: 'Bluesky' },
  ];

  const [posts] = useState<Post[]>(testData);
  const [wordPositions, setWordPositions] = useState<WordPosition[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Get container dimensions
      const updateDimensions = () => {
        const container = document.getElementById('word-cloud-container');
        if (container) {
          setDimensions({
            width: container.offsetWidth,
            height: container.offsetHeight
          });
        }
      };

      // Initial update and add resize listener
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      
      return () => window.removeEventListener('resize', updateDimensions);
    } catch (err: any) {
      console.error('Error updating dimensions:', err);
      setError(`Failed to initialize word cloud: ${err.message || 'Unknown error'}`);
    }
  }, []);

  useEffect(() => {
    try {
      // Only proceed if we have dimensions
      if (dimensions.width === 0 || dimensions.height === 0) return;
      
      // Process words and create initial positions
      const words = processWords();
      const positions = words.map(word => ({
        ...word,
        x: Math.random() * (dimensions.width - 100),
        y: Math.random() * (dimensions.height - 50),
        dx: (Math.random() - 0.5) * 1,
        dy: (Math.random() - 0.5) * 1
      }));
      
      setWordPositions(positions);
      
      // Animation loop
      let animationFrameId: number;
      
      function animate() {
        setWordPositions(prevPositions => 
          prevPositions.map(word => {
            // Update position
            let x = word.x + word.dx;
            let y = word.y + word.dy;
            let { dx, dy } = word;
            
            // Bounce off edges
            if (x <= 0 || x >= dimensions.width - 100) {
              dx = -dx;
              x = word.x + dx;
            }
            
            if (y <= 0 || y >= dimensions.height - 50) {
              dy = -dy;
              y = word.y + dy;
            }
            
            return { ...word, x, y, dx, dy };
          })
        );
        
        animationFrameId = requestAnimationFrame(animate);
      }
      
      animationFrameId = requestAnimationFrame(animate);
      
      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    } catch (err: any) {
      console.error('Error in animation effect:', err);
      setError(`Failed to animate word cloud: ${err.message || 'Unknown error'}`);
    }
  }, [dimensions]);

  // Process posts for the word cloud
  const processWords = () => {
    try {
      // Extract words from post texts
      let allWords: string[] = [];
      posts.forEach(post => {
        if (post.text) {
          const words = post.text
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3 && !['this', 'that', 'with', 'from', 'have', 'your', 'today'].includes(word));
          
          allWords = [...allWords, ...words];
        }
      });
      
      // Count word frequencies
      const wordFrequency = _.countBy(allWords);
      
      // Convert to array of objects for display
      const wordCloud = Object.keys(wordFrequency)
        .map(word => ({ 
          text: word, 
          count: wordFrequency[word],
          source: getWordSource(word)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 30); // Limit to top 30 words
      
      return wordCloud;
    } catch (err: any) {
      console.error('Error processing words:', err);
      setError(`Failed to process word cloud data: ${err.message || 'Unknown error'}`);
      return [];
    }
  };

  // Get a source for each word based on which posts it appears in most
  const getWordSource = (word: string): Post['source'] => {
    try {
      const sourceCount: Record<Post['source'], number> = { 
        Instagram: 0, 
        Twitter: 0, 
        TikTok: 0, 
        Substack: 0,
        Bluesky: 0
      };
      
      posts.forEach(post => {
        if (post.text && post.text.toLowerCase().includes(word)) {
          sourceCount[post.source]++;
        }
      });
      
      return Object.keys(sourceCount).reduce((a, b) => 
        sourceCount[a as Post['source']] > sourceCount[b as Post['source']] ? a : b
      ) as Post['source'];
    } catch (err: any) {
      console.error('Error determining word source:', err);
      return 'Twitter'; // Default fallback
    }
  };

  // Calculate font size based on word frequency
  const getFontSize = (count: number): number => {
    try {
      const maxCount = Math.max(...wordPositions.map(w => w.count));
      const minCount = Math.min(...wordPositions.map(w => w.count));
      
      const minFontSize = 16;
      const maxFontSize = 40;
      
      if (maxCount === minCount) return minFontSize;
      
      return minFontSize + ((count - minCount) / (maxCount - minCount)) * (maxFontSize - minFontSize);
    } catch (err: any) {
      console.error('Error calculating font size:', err);
      return 16; // Fallback to minimum font size
    }
  };

  // Get CSS class based on source
  const getSourceClass = (source: Post['source']): string => {
    try {
      return `word-source-${source.toLowerCase()}`;
    } catch (err: any) {
      console.error('Error getting source class:', err);
      return 'word-source-twitter'; // Fallback class
    }
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Cloud className="w-8 h-8 mr-2 text-blue-500" />
        <h1 className="text-3xl font-bold">Social Media Text Cloud</h1>
      </div>
      
      <div 
        id="word-cloud-container" 
        className="word-cloud-container"
      >
        {wordPositions.map((word, index) => (
          <div 
            key={index} 
            className={`word-cloud-word ${getSourceClass(word.source)}`}
            style={{ 
              fontSize: `${getFontSize(word.count)}px`,
              left: `${word.x}px`,
              top: `${word.y}px`
            }}
          >
            {word.text}
          </div>
        ))}
      </div>
      
      <div className="word-cloud-legend">
        <div className="legend-item">
          <div className="legend-dot legend-dot-instagram"></div>
          <span>Instagram</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot legend-dot-twitter"></div>
          <span>Twitter</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot legend-dot-tiktok"></div>
          <span>TikTok</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot legend-dot-substack"></div>
          <span>Substack</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot legend-dot-bluesky"></div>
          <span>Bluesky</span>
        </div>
      </div>
    </div>
  );
};

export default SocialTextCloud;
