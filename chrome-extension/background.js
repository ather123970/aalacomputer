// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'imageCopied') {
    console.log('Image copied from Google Images:', request.url);
    sendResponse({ status: 'received' });
  }
});

// Listen for tab updates to auto-trigger image extraction
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('google.com/search')) {
    // Check if this is a Google Images search
    if (tab.url.includes('tbm=isch')) {
      // Wait a moment for images to load, then trigger extraction
      setTimeout(() => {
        chrome.tabs.sendMessage(tabId, { action: 'extractFirstImage' }).catch(() => {
          // Ignore errors if content script not ready
        });
      }, 2500);
    }
  }
});
