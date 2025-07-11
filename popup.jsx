import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';

function Popup() {
  const [clips, setClips] = useState([]);
  const [headers, setHeaders] = useState([]);

  useEffect(() => {
    chrome.storage.local.get(['clips'], (result) => {
      const allClips = result.clips || [];
      setClips(allClips);

      // Use 'header' instead of 'tag'
      const foundHeaders = allClips
        .map(c => c.header)
        .filter(header => header && header.trim() !== '');
      setHeaders([...new Set(foundHeaders)]);
    });
  }, []);

  const clearClipsByHeader = (header) => {
    const updated = clips.filter(c => c.header !== header);
    chrome.storage.local.set({ clips: updated }, () => {
      setClips(updated);
      setHeaders([...new Set(updated.map(c => c.header).filter(Boolean))]);
    });
  };

  const clearAll = () => {
    chrome.storage.local.remove('clips', () => {
      setClips([]);
      setHeaders([]);
    });
  };

  const openViewPage = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('view.html') });
  };

  return (
    <div className="popup-container">
      <div className="popup-header">
        <h2>📎 Tags</h2>
        {headers.length > 0 && (
          <button className="clear-all" onClick={clearAll}>🧹 Clear All</button>
        )}
      </div>

      {headers.length === 0 ? (
        <p>No headers found.</p>
      ) : (
        <ul className="tag-list">
          {headers.map((header, index) => (
            <li className="tag-item" key={index}>
              <span className="tag-name">🔖 {header}</span>
              <button className="remove-btn" onClick={() => clearClipsByHeader(header)}>❌</button>
            </li>
          ))}
        </ul>
      )}

      <button className="view-btn" onClick={openViewPage}>📂 View All Clips</button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Popup />);
