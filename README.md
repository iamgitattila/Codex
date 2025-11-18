# YouTube Shorts Link Extractor

A simple Chrome extension that extracts YouTube Shorts video IDs from the page and generates the proper YouTube Shorts link.

## Features

- Extracts video ID from YouTube thumbnail images (e.g., from `marketing-image` element)
- Generates properly formatted YouTube Shorts links
- Copy link to clipboard with one click

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked"
4. Select the folder containing this extension

## Usage

1. Navigate to any page containing YouTube Shorts thumbnail (e.g., embedded videos, emails, etc.)
2. Click the extension icon in your browser toolbar
3. Click "Extract Shorts Link" button
4. The extension will:
   - Find the video ID from the thumbnail image (looks for images with src like `https://i.ytimg.com/vi/VIDEO_ID/maxresdefault.jpg`)
   - Display the video ID
   - Show the formatted YouTube Shorts link: `https://www.youtube.com/shorts/VIDEO_ID`
   - Provide a "Copy Link" button to copy the URL to clipboard

## How It Works

The extension searches for:
1. An image element with id `marketing-image`
2. Any image with YouTube thumbnail URL pattern (`ytimg.com/vi/`)

It then extracts the video ID from the image src and formats it as a YouTube Shorts link.

## Example

If the page contains:
```html
<img id="marketing-image" src="https://i.ytimg.com/vi/NggBU-gpeDg/maxresdefault.jpg">
```

The extension will generate:
```
https://www.youtube.com/shorts/NggBU-gpeDg
```

## Files

- `manifest.json` - Extension configuration
- `popup.html` - Extension popup UI
- `popup.js` - Logic for extracting video ID and generating links