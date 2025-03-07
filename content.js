let isCollectionModeActive = false;
let highlightedImages = [];

// Listen for messages from background script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'showNotification') {
    showNotification(request.imageSrc);
  }
});

function handleImageClick(event) {
  if (!isCollectionModeActive) return;

  event.preventDefault();
  event.stopPropagation();

  const img = event.target;

  // Send message to background script with image info
  chrome.runtime.sendMessage({
    action: 'imageCollected',
    imageSrc: img.src,
    pageUrl: window.location.href,
    pageTitle: document.title
  });

  // Show notification
  showNotification(img.src);
}

function showNotification(imageSrc) {
  const notification = document.createElement('div');
  notification.className = 'treasure-chest-notification';
  notification.innerHTML = `
    <img src="${imageSrc}" alt="Collected image">
    <div class="treasure-chest-notification-text">
      <div class="notification-title">Added to Treasure Chest!</div>
      <div class="notification-subtitle">Image has been saved to your collection</div>
    </div>
  `;

  document.body.appendChild(notification);

  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    notification.style.transition = 'all 0.5s ease-out';

    setTimeout(() => {
      notification.remove();
    }, 500);
  }, 3000);
}
