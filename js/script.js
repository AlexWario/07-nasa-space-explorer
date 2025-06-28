// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Find the button and gallery elements
const getImagesButton = document.querySelector('button');
const gallery = document.getElementById('gallery');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// NASA APOD API configuration
const NASA_API_KEY = 'DEMO_KEY'; // Using demo key for educational purposes
const NASA_APOD_URL = 'https://api.nasa.gov/planetary/apod';

// Array of fun space facts for the "Did You Know?" section
const SPACE_FACTS = [
  "A day on Venus is longer than its year! Venus rotates so slowly that it takes 243 Earth days to complete one rotation, but only 225 Earth days to orbit the Sun.",
  "There are more possible games of chess than there are atoms in the observable universe. The observable universe contains about 10^82 atoms, while there are about 10^120 possible chess games.",
  "Neutron stars are so dense that a teaspoon of neutron star material would weigh about 6 billion tons on Earth - that's about 900 times the weight of the Great Pyramid of Giza!",
  "The footprints left by Apollo astronauts on the Moon will last for millions of years because there's no wind or water to erode them away.",
  "Jupiter's Great Red Spot is a storm that has been raging for at least 350 years and is larger than Earth itself.",
  "If you could drive a car straight up at highway speed, it would take you about an hour to reach space (62 miles up).",
  "The Sun accounts for 99.86% of the mass in our Solar System. All the planets, moons, asteroids, and comets combined make up just 0.14%.",
  "One million Earths could fit inside the Sun, but the Sun is considered an average-sized star in our galaxy.",
  "Saturn's moon Titan has lakes and rivers, but they're made of liquid methane and ethane instead of water.",
  "The Milky Way galaxy is on a collision course with the Andromeda galaxy, but don't worry - the collision won't happen for about 4.5 billion years!",
  "A year on Pluto lasts 248 Earth years. Since Pluto was discovered in 1930, it still hasn't completed one full orbit around the Sun.",
  "The International Space Station travels at 17,500 mph and orbits Earth every 90 minutes, meaning astronauts see 16 sunrises and sunsets every day.",
  "Mars has the largest volcano in the Solar System - Olympus Mons - which is about 13.6 miles high, nearly three times taller than Mount Everest.",
  "The coldest place in the universe that we know of is the Boomerang Nebula, where temperatures reach -458°F (-272°C), just 1 degree above absolute zero.",
  "A black hole's gravity is so strong that time actually slows down near it. This effect is called gravitational time dilation.",
  "The universe is expanding so fast that galaxies are moving away from us faster than the speed of light due to the expansion of space itself."
];

// Function to get a random space fact
function getRandomSpaceFact() {
  const randomIndex = Math.floor(Math.random() * SPACE_FACTS.length);
  return SPACE_FACTS[randomIndex];
}

// Function to display the random space fact
function displaySpaceFact() {
  const spaceFact = getRandomSpaceFact();
  const factContainer = document.getElementById('space-fact');
  
  if (factContainer) {
    factContainer.innerHTML = `
      <div class="space-fact-content">
        <h3 class="space-fact-title">🌟 Did You Know?</h3>
        <p class="space-fact-text">${spaceFact}</p>
      </div>
    `;
  }
}

// Function to create and show the modal
function createModal() {
  // Check if modal already exists, if not create it
  let modal = document.getElementById('imageModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'imageModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-close">&times;</span>
        </div>
        <div class="modal-image-container">
          <img id="modalImage" src="" alt="" />
          <div id="modalVideoPlaceholder" class="modal-video-placeholder" style="display: none;">
            <div class="video-icon">📹</div>
            <p>Video content</p>
            <a id="modalVideoLink" href="" target="_blank">Watch on NASA's Website</a>
          </div>
        </div>
        <div class="modal-details">
          <div class="modal-info-section">
            <h2 id="modalTitle" class="modal-title"></h2>
            <div class="modal-meta">
              <p id="modalDate" class="modal-date"></p>
              <p id="modalCopyright" class="modal-copyright"></p>
            </div>
          </div>
          <div class="modal-description-section">
            <h3 class="modal-section-title">Mission Description</h3>
            <p id="modalExplanation" class="modal-explanation"></p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Add event listeners for closing the modal
    setupModalCloseEvents(modal);
    
    // Add mobile gesture support
    addModalGestureSupport(modal);
  }
  return modal;
}

// Function to set up modal close events
function setupModalCloseEvents(modal) {
  const closeBtn = modal.querySelector('.modal-close');
  
  // Close when clicking the X button
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  // Close when clicking outside the modal content
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
  
  // Close when pressing the Escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.style.display === 'block') {
      modal.style.display = 'none';
    }
  });
}

// Function to open the modal with image data
function openModal(imageData) {
  const modal = createModal();
  
  // Get modal elements
  const modalImage = document.getElementById('modalImage');
  const modalVideoPlaceholder = document.getElementById('modalVideoPlaceholder');
  const modalVideoLink = document.getElementById('modalVideoLink');
  const modalTitle = document.getElementById('modalTitle');
  const modalDate = document.getElementById('modalDate');
  const modalExplanation = document.getElementById('modalExplanation');
  const modalCopyright = document.getElementById('modalCopyright');
  
  // Fill in the modal content
  modalTitle.textContent = imageData.title;
  modalDate.textContent = formatDate(imageData.date);
  modalExplanation.textContent = imageData.explanation;
  
  // Handle copyright information
  if (imageData.copyright) {
    modalCopyright.textContent = `© ${imageData.copyright}`;
    modalCopyright.style.display = 'block';
  } else {
    modalCopyright.style.display = 'none';
  }
  
  // Enhanced video vs image handling in modal
  const isVideo = imageData.media_type === 'video';
  const isYouTube = isVideo && imageData.url && imageData.url.includes('youtube.com');
  
  if (!isVideo) {
    // Handle image content
    modalImage.src = imageData.hdurl || imageData.url; // Use HD version if available
    modalImage.alt = imageData.title;
    modalImage.style.display = 'block';
    modalVideoPlaceholder.style.display = 'none';
  } else {
    // Handle video content
    if (isYouTube) {
      // For YouTube videos, create an embedded player in the modal
      modalVideoPlaceholder.innerHTML = `
        <div class="modal-youtube-container">
          <iframe src="${getYouTubeEmbedUrl(imageData.url)}" 
                  title="${imageData.title}"
                  frameborder="0" 
                  allowfullscreen
                  class="modal-youtube-embed">
          </iframe>
        </div>
      `;
    } else {
      // For other videos, show enhanced link
      modalVideoPlaceholder.innerHTML = `
        <div class="video-icon">📹</div>
        <p class="modal-video-title">Video Content</p>
        <p class="modal-video-description">This APOD entry features a video. Click below to watch it on NASA's website.</p>
        <a id="modalVideoLink" href="${imageData.url}" target="_blank" class="modal-video-button">
          <span class="video-play-icon">▶</span>
          Watch on NASA's Website
        </a>
      `;
    }
    
    modalImage.style.display = 'none';
    modalVideoPlaceholder.style.display = 'flex';
  }
  
  // Show the modal
  modal.style.display = 'block';
}

// Function to fetch space images from NASA's APOD API
async function fetchSpaceImages(startDate, endDate) {
  try {
    // Show enhanced loading message with NASA branding
    gallery.innerHTML = `
      <div class="loading">
        <div class="loading-text">Loading space images from NASA...</div>
        <p style="font-size: 14px; margin-top: 10px; color: var(--nasa-gray);">
          Fetching images from ${formatDate(startDate)} to ${formatDate(endDate)}
        </p>
      </div>
    `;
    
    // Build the API URL with our parameters
    const apiUrl = `${NASA_APOD_URL}?api_key=${NASA_API_KEY}&start_date=${startDate}&end_date=${endDate}`;
    
    // Make the API request
    const response = await fetch(apiUrl);
    
    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    // Convert the response to JSON
    const data = await response.json();
    
    // Display the images in our gallery
    displayImages(data);
    
  } catch (error) {
    // Show error message if something goes wrong
    console.error('Error fetching space images:', error);
    gallery.innerHTML = `
      <div class="error">
        <div class="error-icon">⚠️</div>
        <p>Oops! We couldn't load the space images. Please try again.</p>
        <p class="error-details">${error.message}</p>
      </div>
    `;
  }
}

// Function to display the fetched images in the gallery
function displayImages(images) {
  // Clear the gallery
  gallery.innerHTML = '';
  
  // Check if we have any images
  if (!images || images.length === 0) {
    gallery.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🌌</div>
        <p>No space images found for this date range.</p>
      </div>
    `;
    return;
  }
  
  // Create a card for each image
  images.forEach(image => {
    const card = createImageCard(image);
    gallery.appendChild(card);
  });
}

// Function to create an individual image card
function createImageCard(imageData) {
  // Create the main card container
  const card = document.createElement('div');
  card.className = 'image-card';
  
  // Enhanced video detection and handling
  const isVideo = imageData.media_type === 'video';
  const isYouTube = isVideo && imageData.url && imageData.url.includes('youtube.com');
  
  // Build the card content with enhanced video support - showing only title and date initially
  card.innerHTML = `
    <div class="image-container">
      ${!isVideo 
        ? `<img src="${imageData.url}" alt="${imageData.title}" loading="lazy" class="gallery-image" />`
        : isYouTube
        ? `<div class="video-embed-container">
             <iframe src="${getYouTubeEmbedUrl(imageData.url)}" 
                     title="${imageData.title}"
                     frameborder="0" 
                     allowfullscreen
                     class="youtube-embed">
             </iframe>
           </div>`
        : `<div class="video-placeholder">
             <div class="video-icon">📹</div>
             <p class="video-title">Video Content</p>
             <a href="${imageData.url}" target="_blank" class="video-link">
               <span class="video-play-icon">▶</span>
               Watch Video
             </a>
           </div>`
      }
    </div>
    <div class="card-content">
      <h3 class="image-title">${imageData.title}</h3>
      <p class="image-date">${formatDate(imageData.date)}</p>
      <!-- Description and copyright are hidden initially and shown in modal -->
    </div>
  `;
  
  // Add click event to open modal (but not for embedded videos)
  if (!isYouTube) {
    card.addEventListener('click', (event) => {
      // Don't open modal if clicking on video link
      if (!event.target.closest('.video-link')) {
        openModal(imageData);
      }
    });
    
    // Add mobile touch feedback
    card.addEventListener('touchstart', function() {
      this.style.transform = 'translateY(-2px) scale(0.98)';
    }, { passive: true });
    
    card.addEventListener('touchend', function() {
      this.style.transform = '';
    }, { passive: true });
    
    // Add cursor pointer to indicate clickability
    card.style.cursor = 'pointer';
    
    // Ensure touch-action is set for mobile
    card.style.touchAction = 'manipulation';
  }
  
  return card;
}

// Function to convert YouTube URL to embed URL
function getYouTubeEmbedUrl(url) {
  // Extract video ID from various YouTube URL formats
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
  }
  
  // If we can't parse it, return the original URL
  return url;
}

// Function to format the date in a user-friendly way
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Add event listener to the "Get Space Images" button
getImagesButton.addEventListener('click', () => {
  // Get the selected date range
  const startDate = startInput.value;
  const endDate = endInput.value;
  
  // Validate that both dates are selected
  if (!startDate || !endDate) {
    alert('Please select both start and end dates to explore space images!');
    return;
  }
  
  // Validate that start date is not after end date
  if (new Date(startDate) > new Date(endDate)) {
    alert('Start date cannot be after end date. Please check your selection!');
    return;
  }
  
  // Fetch and display the space images
  fetchSpaceImages(startDate, endDate);
});

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Display a random space fact when the page loads
  displaySpaceFact();
  
  // Initialize mobile support
  addMobileSupport();
});

// Display a random space fact on initial load
displaySpaceFact();

// Enhanced mobile support and touch interactions
function addMobileSupport() {
  // Prevent iOS zoom on input focus
  const inputs = document.querySelectorAll('input[type="date"]');
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      // Temporarily increase font size to prevent zoom
      this.style.fontSize = '16px';
    });
    
    input.addEventListener('blur', function() {
      // Reset font size
      this.style.fontSize = '';
    });
  });
  
  // Add touch feedback for cards
  const addTouchFeedback = (element) => {
    element.addEventListener('touchstart', function() {
      this.style.transform = 'translateY(-2px) scale(0.98)';
    }, { passive: true });
    
    element.addEventListener('touchend', function() {
      this.style.transform = '';
    }, { passive: true });
  };
  
  // Apply touch feedback to existing cards
  document.querySelectorAll('.image-card').forEach(addTouchFeedback);
  
  // Detect if user is on mobile for better UX
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) {
    document.body.classList.add('mobile-device');
  }
  
  // Handle orientation changes
  window.addEventListener('orientationchange', function() {
    setTimeout(() => {
      // Recalculate layout after orientation change
      const gallery = document.getElementById('gallery');
      if (gallery && gallery.children.length > 0) {
        // Force a reflow to fix any layout issues
        gallery.style.display = 'none';
        gallery.offsetHeight; // Trigger reflow
        gallery.style.display = 'grid';
      }
    }, 100);
  });
}

// Enhanced gesture support for mobile modal
function addModalGestureSupport(modal) {
  let startY = 0;
  let currentY = 0;
  let isDragging = false;
  
  const modalContent = modal.querySelector('.modal-content');
  
  modalContent.addEventListener('touchstart', function(e) {
    startY = e.touches[0].clientY;
    isDragging = true;
  }, { passive: true });
  
  modalContent.addEventListener('touchmove', function(e) {
    if (!isDragging) return;
    
    currentY = e.touches[0].clientY;
    const diffY = currentY - startY;
    
    // Only allow downward swipe to close
    if (diffY > 0) {
      const opacity = 1 - (diffY / 300);
      const scale = 1 - (diffY / 1000);
      
      modalContent.style.transform = `translateY(${diffY}px) scale(${Math.max(scale, 0.9)})`;
      modal.style.backgroundColor = `rgba(0, 0, 0, ${Math.max(opacity * 0.5, 0)})`;
    }
  }, { passive: true });
  
  modalContent.addEventListener('touchend', function(e) {
    if (!isDragging) return;
    
    const diffY = currentY - startY;
    
    if (diffY > 100) {
      // Close modal if swiped down significantly
      modal.style.display = 'none';
    } else {
      // Reset position
      modalContent.style.transform = '';
      modal.style.backgroundColor = '';
    }
    
    isDragging = false;
  }, { passive: true });
}

// Call the mobile support function
addMobileSupport();
