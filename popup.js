document.getElementById('extractBtn').addEventListener('click', async () => {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = 'Extracting...';

  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Execute script in the page to find the video ID
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractVideoId
    });

    const videoId = results[0].result;

    if (videoId) {
      const shortsUrl = `https://www.youtube.com/shorts/${videoId}`;
      resultDiv.innerHTML = `
        <div>Video ID: <strong>${videoId}</strong></div>
        <div style="margin-top: 10px;">
          <a href="${shortsUrl}" target="_blank" class="link">${shortsUrl}</a>
        </div>
        <button onclick="navigator.clipboard.writeText('${shortsUrl}')">Copy Link</button>
      `;
    } else {
      resultDiv.innerHTML = '<div class="error">No YouTube Shorts video ID found on this page.</div>';
    }
  } catch (error) {
    resultDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
  }
});

// This function runs in the context of the web page
function extractVideoId() {
  // Try to find the marketing image
  const marketingImage = document.getElementById('marketing-image');

  if (marketingImage && marketingImage.src) {
    // Extract video ID from src like: https://i.ytimg.com/vi/NggBU-gpeDg/maxresdefault.jpg
    const match = marketingImage.src.match(/\/vi\/([^\/]+)\//);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Fallback: search all images for YouTube thumbnail pattern
  const allImages = document.querySelectorAll('img[src*="ytimg.com/vi/"]');
  for (const img of allImages) {
    const match = img.src.match(/\/vi\/([^\/]+)\//);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}
