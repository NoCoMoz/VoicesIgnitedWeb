import React, { useState } from 'react';
import BlueSkyFeed from '../src/components/BlueSkyFeed/BlueSkyFeed';

export default function TestBlueSkyPage() {
  const [testScenario, setTestScenario] = useState<string>('normal');

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>BlueSky Feed Test Page</h1>
      
      {/* Test Controls */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setTestScenario('normal')}
          style={{ 
            padding: '8px 16px', 
            marginRight: '10px',
            background: testScenario === 'normal' ? '#c6953b' : '#f0f0f0'
          }}
        >
          Normal Feed
        </button>
        <button 
          onClick={() => setTestScenario('error')}
          style={{ 
            padding: '8px 16px', 
            marginRight: '10px',
            background: testScenario === 'error' ? '#c6953b' : '#f0f0f0'
          }}
        >
          Test Error
        </button>
        <button 
          onClick={() => setTestScenario('loading')}
          style={{ 
            padding: '8px 16px',
            background: testScenario === 'loading' ? '#c6953b' : '#f0f0f0'
          }}
        >
          Test Loading
        </button>
      </div>

      {/* Feed Component */}
      <div style={{ marginTop: '20px' }}>
        <BlueSkyFeed 
          feedActor={testScenario === 'error' ? 'invalid.user' : 'voicesignited.bsky.social'}
          postLimit={testScenario === 'loading' ? 100 : 20}
          title="Voices Ignited BlueSky Feed"
        />
      </div>
    </div>
  );
}
