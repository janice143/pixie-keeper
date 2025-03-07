document.addEventListener('DOMContentLoaded', function () {
  const collectionGrid = document.getElementById('collectionGrid');
  // const searchInput = document.getElementById('searchInput');
  const exportBtn = document.getElementById('exportBtn');
  const speechBubble = document.getElementById('speechBubble');

  // Guide character phrases
  const guidePhrases = [
    'Here are all your treasured images! Hover over them to see details or download them.',
    'Each image in your collection tells a story. Cherish them!',
    'Your collection is growing beautifully. Keep finding treasures!',
    'You can search for specific images using the search box.',
    'Want to share your collection? Use the export button!'
  ];

  // Change guide character phrase randomly every 15 seconds
  setInterval(() => {
    const randomIndex = Math.floor(Math.random() * guidePhrases.length);
    speechBubble.textContent = guidePhrases[randomIndex];
  }, 15000);

  // Load all collected images
  loadCollection();

  // Search functionality
  // searchInput.addEventListener('input', function () {
  //   const searchTerm = this.value.toLowerCase();
  //   filterCollection(searchTerm);
  // });

  // Export functionality
  exportBtn.addEventListener('click', function () {
    exportCollection();
  });

  function loadCollection() {
    chrome.storage.local.get({ collectedImages: [] }, function (data) {
      const collectedImages = data.collectedImages;

      if (collectedImages.length === 0) {
        collectionGrid.innerHTML = `
          <div class="empty-state">
            <p>Your collection is empty. Start collecting images by activating collection mode while browsing!</p>
          </div>
        `;
        return;
      }

      collectionGrid.innerHTML = '';

      collectedImages.forEach((image, index) => {
        const date = new Date(image.date);
        const formattedDate =
          date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

        const card = createImageCard(image, index);

        collectionGrid.appendChild(card);
      });

      // Add event listeners to buttons
      addButtonEventListeners();
    });
  }

  function createImageCard(image, index) {
    const card = document.createElement('div');
    card.className = 'image-card';
    card.dataset.title = image.pageTitle || '';
    card.dataset.url = image.pageUrl || '';

    card.innerHTML = `
      <div class="image-container">
        <img src="${image.src}" alt="Collected image">
        <div class="image-actions">
          <a href="${
            image.src
          }" download class="action-btn download-btn" title="Download image">
             <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 12L3 7L4.4 5.55L7 8.15V1H9V8.15L11.6 5.55L13 7L8 12Z" fill="currentColor"/>
              <path d="M2 14V11H4V13H12V11H14V14H2Z" fill="currentColor"/>
            </svg>
          </a>
          <a href="${
            image.pageUrl
          }" target="_blank" class="action-btn source-btn" title="Visit source page">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12H4V4H8V2H4C2.9 2 2 2.9 2 4V12C2 13.1 2.9 14 4 14H12C13.1 14 14 13.1 14 12V8H12V12Z" fill="currentColor"/>
                    <path d="M10 2V4H12.59L6.76 9.83L8.17 11.24L14 5.41V8H16V2H10Z" fill="currentColor"/>
                  </svg>
          </a>
          <button class="action-btn delete-btn" title="Remove from collection">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 12L8 8L12 12L13 11L9 7L13 3L12 2L8 6L4 2L3 3L7 7L3 11L4 12Z" fill="currentColor"/>
                  </svg>
          </button>
        </div>
      </div>
      <div class="image-info">
        <div class="image-date">${new Date(
          image.date
        ).toLocaleDateString()}</div>
        <div class="image-source">
          <a href="${image.pageUrl}" target="_blank" title="${
      image.pageTitle || 'Source page'
    }">${image.pageTitle || 'Untitled page'}</a>
        </div>
      </div>
    `;

    // Add delete confirmation
    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

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

    return card;
  }

  function addButtonEventListeners() {
    // Download buttons
    document.querySelectorAll('.download-btn').forEach((button) => {
      button.addEventListener('click', function (e) {
        e.stopPropagation();
        const card = this.closest('.image-card');
        const img = card.querySelector('img');

        // Create a temporary link to download the image
        const a = document.createElement('a');
        a.href = img.src;
        a.download = 'treasure-chest-image-' + Date.now() + '.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        speechBubble.textContent = 'Image downloaded! Keep it safe!';
      });
    });

    // Remove buttons
    document.querySelectorAll('.remove-btn').forEach((button) => {
      button.addEventListener('click', function (e) {
        e.stopPropagation();
        const card = this.closest('.image-card');
        const index = parseInt(card.dataset.index);

        removeImage(index);
      });
    });

    // Open source page buttons
    document.querySelectorAll('.open-btn').forEach((button) => {
      button.addEventListener('click', function (e) {
        e.stopPropagation();
        const card = this.closest('.image-card');
        const url = card.dataset.url;

        chrome.tabs.create({ url: url });
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
          loadCollection();
          speechBubble.textContent = 'Image removed from your collection.';
        }
      );
    });
  }

  // function filterCollection(searchTerm) {
  //   const cards = document.querySelectorAll('.image-card');

  //   cards.forEach((card) => {
  //     const title = card.dataset.title.toLowerCase();
  //     const url = card.dataset.url.toLowerCase();

  //     if (title.includes(searchTerm) || url.includes(searchTerm)) {
  //       card.style.display = 'block';
  //     } else {
  //       card.style.display = 'none';
  //     }
  //   });

  //   // Check if any cards are visible
  //   const visibleCards = document.querySelectorAll(
  //     '.image-card[style="display: block"]'
  //   );
  //   if (cards.length > 0 && visibleCards.length === 0) {
  //     // No results found
  //     if (!document.querySelector('.no-results')) {
  //       const noResults = document.createElement('div');
  //       noResults.className = 'empty-state no-results';
  //       noResults.innerHTML = `<p>No images match your search. Try different keywords!</p>`;
  //       collectionGrid.appendChild(noResults);
  //     }
  //   } else {
  //     // Remove no results message if it exists
  //     const noResults = document.querySelector('.no-results');
  //     if (noResults) {
  //       noResults.remove();
  //     }
  //   }
  // }

  function exportCollection() {
    chrome.storage.local.get({ collectedImages: [] }, async function (data) {
      const collectedImages = data.collectedImages;

      if (collectedImages.length === 0) {
        speechBubble.textContent =
          'Your collection is empty. Nothing to export!';
        return;
      }

      try {
        // Create a new ZIP file
        const zip = new JSZip();

        // Create a folder for the images
        const imgFolder = zip.folder('treasure-chest-images');

        // Download each image and add it to the ZIP
        const fetchPromises = collectedImages.map(async (image, index) => {
          try {
            const response = await fetch(image.src);
            const blob = await response.blob();

            // Get file extension from mime type or default to jpg
            const mimeType =
              response.headers.get('content-type') || 'image/jpeg';
            const extension = mimeType.split('/')[1] || 'jpg';

            // Create filename with date and index
            const date = new Date(image.date);
            const dateStr = date.toISOString().split('T')[0];
            const filename = `image_${dateStr}_${index + 1}.${extension}`;

            // Add to zip
            imgFolder.file(filename, blob);

            return {
              filename,
              pageUrl: image.pageUrl,
              pageTitle: image.pageTitle,
              date: image.date
            };
          } catch (error) {
            console.error(`Failed to fetch image: ${image.src}`, error);
            return null;
          }
        });

        // Wait for all images to be processed
        const results = await Promise.all(fetchPromises);

        // Create metadata file
        const metadata = {
          exportDate: new Date().toISOString(),
          totalImages: collectedImages.length,
          images: results.filter((r) => r !== null)
        };

        zip.file('metadata.json', JSON.stringify(metadata, null, 2));

        // Generate zip file
        const zipBlob = await zip.generateAsync({ type: 'blob' });

        // Create download link
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        a.href = url;
        a.download = `treasure-chest-collection-${timestamp}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        speechBubble.textContent =
          'Collection exported successfully! Your treasures are safe!';
      } catch (error) {
        console.error('Export failed:', error);
        speechBubble.textContent =
          'Sorry, there was an error exporting your collection.';
      }
    });
  }
});
