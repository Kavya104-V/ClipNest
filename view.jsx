import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';

function ViewClips() {
  const [clips, setClips] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    chrome.storage.local.get(['clips'], (result) => {
      if (result.clips) setClips(result.clips);
    });
  }, []);

  const clearAllClips = () => {
    chrome.storage.local.remove('clips', () => {
      setClips([]);
    });
  };

 

  const deleteClip = (index) => {
    const updated = [...clips];
    updated.splice(index, 1);
    chrome.storage.local.set({ clips: updated }, () => {
      setClips(updated);
    });
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(clips, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    downloadFile(url, 'clips.json');
  };

  const exportCSV = () => {
    const headers = ['Title', 'URL', 'Content', 'Tag', 'Timestamp'];
    const rows = clips.map(c => [c.title, c.url, c.content, c.tag || '', c.timestamp]);
    const csvContent = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    downloadFile(url, 'clips.csv');
  };

  const downloadFile = (url, filename) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const filteredClips = clips.filter(clip =>
  clip.title?.toLowerCase().includes(filter.toLowerCase()) ||
  clip.content?.toLowerCase().includes(filter.toLowerCase()) ||
  clip.header?.toLowerCase().includes(filter.toLowerCase())
);


const uniqueTags = Array.from(new Set(clips.map(c => c.header).filter(Boolean)));


  return (
    <div className="view-container">
      <h1>📎 Saved Clips</h1>

      <div className="top-actions">
        <input
          type="text"
          placeholder="Search by text or tag..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button className="clear-all" onClick={clearAllClips}>🧹 Clear All</button>
      </div>

      

      <div className="export-actions">
        <button onClick={exportJSON}>📤 Export JSON</button>
        <button onClick={exportCSV}>📤 Export CSV</button>
      </div>

      {filteredClips.length === 0 ? (
        <p>No matching clips.</p>
      ) : (
        <ul className="clip-list">
          {filteredClips.map((clip, i) => (
            <li key={i} className="clip-item">
              <div className="clip-header">
                <h3>{clip.header || 'Untitled Clip'}</h3>
                <button className="delete-clip" onClick={() => deleteClip(i)}>❌</button>
              </div>
              <a href={clip.url} target="_blank" rel="noopener noreferrer">{clip.title}</a>
              <small>{new Date(clip.timestamp).toLocaleString()}</small>
              <div className="clip-box">{clip.content}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<ViewClips />);
