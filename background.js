chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveSelection",
    title: "💾 Save selected text to Web Clipper",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "savePage",
    title: "📝 Save entire page to Web Clipper",
    contexts: ["page"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "saveSelection" && info.selectionText) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        return prompt("Enter a header or title for this clip:");
      }
    }).then((results) => {
      const header = results?.[0]?.result || "Untitled Clip";

      const newClip = {
        header: header.trim(),
        title: tab.title,
        url: tab.url,
        content: info.selectionText,
        timestamp: new Date().toISOString()
      };

      chrome.storage.local.get(["clips"], (result) => {
        const updated = result.clips ? [newClip, ...result.clips] : [newClip];
        chrome.storage.local.set({ clips: updated });
        console.log("✅ Clip saved with header:", header);
      });
    }).catch(err => {
      console.error("🚫 Failed to inject header prompt:", err.message);
    });
  }

  // ✅ Handle full page save
  if (info.menuItemId === "savePage") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        return prompt("Enter a header for this full page clip:");
      }
    }).then((results) => {
      const header = results?.[0]?.result || "Full Page";

      const newClip = {
        header: header.trim(),
        title: tab.title,
        url: tab.url,
        content: "", // No text selected
        timestamp: new Date().toISOString()
      };

      chrome.storage.local.get(["clips"], (result) => {
        const updated = result.clips ? [newClip, ...result.clips] : [newClip];
        chrome.storage.local.set({ clips: updated });
        console.log("✅ Full page saved with header:", header);
      });
    }).catch(err => {
      console.error("🚫 Failed to inject header prompt for full page:", err.message);
    });
  }
});
