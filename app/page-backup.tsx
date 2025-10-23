export default function SimplePage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 AI Content Scheduler</h1>
      <p>Welcome to your AI-powered content creation platform!</p>
      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h2>✨ Features Available:</h2>
        <ul>
          <li>AI Content Generation</li>
          <li>7-Day Content Plans</li>
          <li>Trending Topics Integration</li>
          <li>Multiple Platform Support</li>
          <li>Modern UI with Glassmorphism</li>
        </ul>
      </div>
      <div style={{ marginTop: '20px' }}>
        <button style={{ 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}>
          Get Started
        </button>
      </div>
    </div>
  );
}
