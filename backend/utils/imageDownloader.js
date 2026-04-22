const axios = require('axios');
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../uploads');
const DOWNLOAD_TIMEOUT = parseInt(process.env.IMAGE_DOWNLOAD_TIMEOUT, 10) || 10000;

const MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

/**
 * Download an image from an external URL and save it locally.
 * @param {string} imageUrl - The full HTTPS URL of the image
 * @returns {Promise<string>} The local path, e.g. '/uploads/image-1745320000000.jpg'
 */
async function downloadImage(imageUrl) {
  if (!imageUrl) return null;

  // Pass through data: URIs (SVG from seed) directly — getImageUrl handles them fine
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  if (!/^https?:\/\//i.test(imageUrl)) {
    return null;
  }

  const response = await axios.get(imageUrl, {
    responseType: 'arraybuffer',
    timeout: DOWNLOAD_TIMEOUT,
    maxContentLength: 10 * 1024 * 1024, // 10MB max
    headers: {
      // Spoof a browser User-Agent to avoid blocks on some CDNs
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  const contentType = response.headers['content-type'] || 'image/jpeg';
  const ext = MIME_TO_EXT[contentType.toLowerCase()] || '.jpg';

  const filename = `image-${Date.now()}${ext}`;
  const filePath = path.join(UPLOADS_DIR, filename);

  // Ensure uploads directory exists
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  fs.writeFileSync(filePath, Buffer.from(response.data));
  return `/uploads/${filename}`;
}

module.exports = { downloadImage };
