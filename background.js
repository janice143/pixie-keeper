// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'addToTreasureChest',
    title: 'Add to Treasure Chest',
    contexts: ['image']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'addToTreasureChest') {
    // Get the image source URL
    const imageSrc = info.srcUrl;

    // Add image to collection
    chrome.storage.local.get({ collectedImages: [] }, function (data) {
      const collectedImages = data.collectedImages;
      collectedImages.unshift({
        src: imageSrc,
        date: new Date().toISOString(),
        pageUrl: tab.url,
        pageTitle: tab.title
      });

      // Store updated collection
      chrome.storage.local.set(
        { collectedImages: collectedImages },
        function () {
          // Show notification
          chrome.tabs.sendMessage(tab.id, {
            action: 'showNotification',
            imageSrc: imageSrc
          });
        }
      );
    });
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'imageCollected') {
    // Forward the message to the popup if it's open
    chrome.runtime.sendMessage(request);
  }
});
