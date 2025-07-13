import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';

function ViewClips() {
  const [clips, setClips] = useState([]);
  const [filter, setFilter] = useState('');
  const [loadingIndex, setLoadingIndex] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [editContent, setEditContent] = useState('');
const [editHeader, setEditHeader] = useState('');

  useEffect(() => {
    chrome.storage.local.get(['clips'], (result) => {
      if (result.clips) setClips(result.clips);
    });
  }, []);

  const clearAllClips = () => {
    chrome.storage.local.remove('clips', () => setClips([]));
  };

  const deleteClip = (index) => {
    const updated = [...clips];
    updated.splice(index, 1);
    chrome.storage.local.set({ clips: updated }, () => setClips(updated));
  };

  const togglePin = (index) => {
    const updated = [...clips];
    updated[index].pinned = !updated[index].pinned;
    chrome.storage.local.set({ clips: updated }, () => setClips(updated));
  };

  const startEditing = (index, header, content) => {
  setEditIndex(index);
  setEditHeader(header || '');
  setEditContent(content);
};

  const saveEditedContent = (index) => {
  const updated = [...clips];
  updated[index].content = editContent;
  updated[index].header = editHeader;
  chrome.storage.local.set({ clips: updated }, () => {
    setClips(updated);
    setEditIndex(null);
  });
};


 

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(clips, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    downloadFile(url, 'clips.json');
  };

  const exportCSV = () => {
    const headers = ['Title', 'URL', 'Content', 'Tag', 'Timestamp'];
    const rows = clips.map(c => [c.title, c.url, c.content, c.header || '', c.timestamp]);
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

  const summarizeClip = async (index) => {
    const clip = clips[index];
    const textToSummarize = clip.content;

    if (!textToSummarize || textToSummarize.length < 250) {
      alert("Content too short to summarize.");
      return;
    }

    setLoadingIndex(index);

    try {
      const response = await fetch("https://api.cohere.ai/v1/summarize", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_COHERE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          length: "medium",
          format: "paragraph",
          model: "command",
          extractiveness: "low",
          text: textToSummarize
        })
      });

      const data = await response.json();
      const summary = data.summary || "No summary available.";

      const updated = [...clips];
      updated[index].summary = summary;
      chrome.storage.local.set({ clips: updated }, () => {
        setClips(updated);
        setLoadingIndex(null);
      });
    } catch (error) {
      console.error("Summarization failed:", error);
      alert("Failed to summarize.");
      setLoadingIndex(null);
    }
  };

  const filteredClips = clips.filter(clip =>
    clip.title?.toLowerCase().includes(filter.toLowerCase()) ||
    clip.content?.toLowerCase().includes(filter.toLowerCase()) ||
    clip.header?.toLowerCase().includes(filter.toLowerCase())
  );

  const sortedClips = [...filteredClips].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

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

     {sortedClips.length === 0 ? (
  <p>No matching clips.</p>
) : (
  <ul className="clip-list">
    {sortedClips.map((clip) => {
      const originalIndex = clips.findIndex(
        (c) => c.timestamp === clip.timestamp && c.content === clip.content
      );

      return (
        <li key={originalIndex} className="clip-item">
            <div className="clip-container">

          <div className="clip-header">
            <h3>{clip.header || 'Untitled Clip'}</h3>

            <div className="clip-actions">
              
              <button onClick={() => summarizeClip(originalIndex)} disabled={loadingIndex === originalIndex}>
                {loadingIndex === originalIndex ? '⏳ Summarizing...' : '✨ Summarize'}
              </button>
              <button onClick={() => togglePin(originalIndex)}>
                {clip.pinned ? '⭐ Pinned' : '☆ Pin'}
              </button>
              <button onClick={() => startEditing(originalIndex, clip.header, clip.content)}>✏️ Edit</button>

              <button onClick={() => deleteClip(originalIndex)}>❌</button>
            </div>
          </div>

          <a href={clip.url} target="_blank" rel="noopener noreferrer">{clip.title}</a>
          <small>{new Date(clip.timestamp).toLocaleString()}</small>

          {editIndex === originalIndex ? (
  <div className="edit-box">
    <input
      type="text"
      placeholder="Edit title/header..."
      value={editHeader}
      onChange={(e) => setEditHeader(e.target.value)}
      className="edit-header-input"
    />
    <textarea
      value={editContent}
      onChange={(e) => setEditContent(e.target.value)}
      rows={6}
      className="edit-textarea"
      placeholder="Edit content..."
    />
    <div className="edit-actions">
      <button onClick={() => saveEditedContent(originalIndex)}>💾 Save</button>
      <button onClick={() => setEditIndex(null)}>❌ Cancel</button>
    </div>
  </div>


) : (
<div className="clip-box">
  {clip.content}
</div>


)}


          {clip.summary && (
            <div className="summary-box">
              <strong>🧠 Summary:</strong>
              <p>{clip.summary}</p>
            </div>
          )}
          </div>
        </li>
      );
    })}
  </ul>
)}

      
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<ViewClips />);
