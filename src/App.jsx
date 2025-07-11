import React, { useEffect, useState } from 'react';

function App() {
  const [clips, setClips] = useState([]);

  // Fetch from chrome.storage.local
  useEffect(() => {
    chrome.storage.local.get(['clips'], (result) => {
      if (result.clips) {
        setClips(result.clips);
      }
    });
  }, []);

  const clearClips = () => {
    chrome.storage.local.remove('clips', () => {
      setClips([]);
    });
  };

  return (
    <div style={{ padding: '10px', maxWidth: '300px', fontFamily: 'Arial' }}>
      <h3>📎 Web Clipper</h3>
      {clips.length === 0 ? (
        <p>No clips saved.</p>
      ) : (
        <ul style={{ padding: 0, listStyleType: 'none' }}>
          {clips.map((clip, i) => (
            <li key={i} style={{ marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
              <a href={clip.url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 'bold' }}>
                {clip.title}
              </a>
              <br />
              <small style={{ color: '#666' }}>{new Date(clip.timestamp).toLocaleString()}</small>
              <div style={{ background: '#f4f4f4', marginTop: '5px', padding: '6px', borderRadius: '4px', fontSize: '13px' }}>
                {clip.content}
              </div>
            </li>
          ))}
        </ul>
      )}
      <button
  onClick={() => chrome.tabs.create({ url: chrome.runtime.getURL('view.html') })}
  style={{ padding: '5px 10px', marginTop: '10px', marginRight: '10px' }}
>
  📄 View All
</button>

      <button onClick={clearClips} style={{ padding: '5px 10px', marginTop: '10px' }}>🗑️ Clear All</button>
    </div>
  );
}

export default App;
