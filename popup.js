document.addEventListener('DOMContentLoaded', function () {
  const viewCollectionBtn = document.getElementById('viewCollectionBtn');
  const recentImagesContainer = document.getElementById('recentImages');
  const guideCharacter = document.getElementById('guideCharacter');
  const speechBubble = document.getElementById('speechBubble');

  let isCollectionModeActive = false;

  // Guide character phrases
  const guidePhrases = [
    'Welcome to your Treasure Chest! Click on any image on the page to add it to your collection.',
    'Found something beautiful? Just click on it to save it forever!',
    'Your treasures are safely stored. You can view them anytime.',
    'Each image you collect is a precious memory preserved.',
    "I'm here to help you build your collection of treasures!"
  ];

  // Change guide character phrase randomly every 10 seconds
  setInterval(() => {
    const randomIndex = Math.floor(Math.random() * guidePhrases.length);
    speechBubble.textContent = guidePhrases[randomIndex];
  }, 10000);

  // Load recent images
  loadRecentImages();

  // View full collection
  viewCollectionBtn.addEventListener('click', function () {
    chrome.tabs.create({ url: 'collection.html' });
  });

  // Listen for messages from content script
  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (request.action === 'imageCollected') {
      // Add the new image to storage
      chrome.storage.local.get({ collectedImages: [] }, function (data) {
        const collectedImages = data.collectedImages;
        collectedImages.unshift({
          src: request.imageSrc,
          date: new Date().toISOString(),
          pageUrl: request.pageUrl,
          pageTitle: request.pageTitle
        });

        // Store updated collection
        chrome.storage.local.set(
          { collectedImages: collectedImages },
          function () {
            // Update the recent images display
            loadRecentImages();

            // Show success message
            speechBubble.textContent =
              "Image added to your treasures! It's beautiful!";
          }
        );
      });
    }
  });

  function loadRecentImages() {
    chrome.storage.local.get({ collectedImages: [] }, function (data) {
      const collectedImages = data.collectedImages;

      if (collectedImages.length === 0) {
        recentImagesContainer.innerHTML = `
          <div class="empty-state">
            <p>Your treasures will appear here</p>
          </div>
        `;
        return;
      }

      recentImagesContainer.innerHTML = '';

      // Display only the 6 most recent images
      const recentImages = collectedImages.slice(0, 6);

      // <div class="remove" data-index="${index}">×</div>

      recentImages.forEach((image, index) => {
        const imageElement = document.createElement('div');
        imageElement.className = 'image-item';
        imageElement.innerHTML = `
          <img src="${image.src}" alt="Collected image" >
          <div class="pop-image-actions">
          <button class="action-btn preview-btn" title="Preview image" data-src="${image.src}" data-index="${index}">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 3C4.5 3 1.5 6 1.5 8C1.5 10 4.5 13 8 13C11.5 13 14.5 10 14.5 8C14.5 6 11.5 3 8 3ZM8 11C6.3 11 5 9.7 5 8C5 6.3 6.3 5 8 5C9.7 5 11 6.3 11 8C11 9.7 9.7 11 8 11Z" fill="currentColor"/>
            <path d="M8 6C6.9 6 6 6.9 6 8C6 9.1 6.9 10 8 10C9.1 10 10 9.1 10 8C10 6.9 9.1 6 8 6Z" fill="currentColor"/>
          </svg>
        </button>
          <button class="action-btn delete-btn" title="Remove from collection" data-index="${index}">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 12L8 8L12 12L13 11L9 7L13 3L12 2L8 6L4 2L3 3L7 7L3 11L4 12Z" fill="currentColor"/>
                  </svg>
          </button>
        </div>
      </div>
        `;
        recentImagesContainer.appendChild(imageElement);
      });

      // Add preview functionality
      document.querySelectorAll('.preview-btn').forEach((previewBtn) => {
        previewBtn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();

          const previewOverlay = document.createElement('div');
          previewOverlay.className = 'preview-overlay';
          previewOverlay.innerHTML = `
        <div class="preview-content">
          <img src="${previewBtn.dataset.src}" alt="Preview">
          </button>
        </div>
      `;

          document.body.appendChild(previewOverlay);

          // Close preview when clicking outside or on close button
          previewOverlay.addEventListener('click', function (e) {
            if (
              e.target === previewOverlay ||
              e.target.className === 'close-preview'
            ) {
              previewOverlay.remove();
            }
          });
        });
      });

      // Add delete confirmation
      document.querySelectorAll('.delete-btn').forEach((deleteBtn) => {
        deleteBtn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();

          const index = parseInt(this.getAttribute('data-index'));
          console.log('🚀 ~ index:', index);

          // Create and show confirmation dialog
          const confirmDialog = document.createElement('div');
          confirmDialog.className = 'confirm-dialog';
          confirmDialog.innerHTML = `
          <div class="confirm-dialog-content">
            <h2>Delete Image</h2>
            <p>Are you sure you want to remove this image from your collection?</p>
            <div class="confirm-dialog-buttons">
              <button class="btn secondary cancel-btn">Cancel</button>
              <button class="btn primary confirm-btn">Delete</button>
            </div>
          </div>
        `;

          document.body.appendChild(confirmDialog);

          // Add event listeners for confirmation buttons
          const cancelBtn = confirmDialog.querySelector('.cancel-btn');
          const confirmBtn = confirmDialog.querySelector('.confirm-btn');

          cancelBtn.addEventListener('click', function () {
            confirmDialog.remove();
          });

          confirmBtn.addEventListener('click', function () {
            removeImage(index);
            confirmDialog.remove();
          });

          // Close dialog when clicking outside
          confirmDialog.addEventListener('click', function (e) {
            if (e.target === confirmDialog) {
              confirmDialog.remove();
            }
          });
        });
      });
    });
  }

  function removeImage(index) {
    chrome.storage.local.get({ collectedImages: [] }, function (data) {
      const collectedImages = data.collectedImages;
      collectedImages.splice(index, 1);

      chrome.storage.local.set(
        { collectedImages: collectedImages },
        function () {
          loadRecentImages();
          speechBubble.textContent = 'Image removed from your collection.';
        }
      );
    });
  }
});
