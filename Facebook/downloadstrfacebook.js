'use strict';
const fs = require('fs');
const axios = require('axios');
async function getAttachments(url) {
  ['attachments.json', 'fb_response.html'].forEach(file => {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  });
  const headers = {
    "sec-fetch-user": "?1",
    "sec-ch-ua-mobile": "?0",
    "sec-fetch-site": "none",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "cache-control": "max-age=0",
    authority: "www.facebook.com",
    "upgrade-insecure-requests": "1",
    "accept-language": "en-GB,en;q=0.9,tr-TR;q=0.8,tr;q=0.7,en-US;q=0.6",
    "sec-ch-ua": '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    cookie: 'PAST YOUR COOKIE HERE TO USE !!!'
  };

  try {
    console.log(`🔍 Dang tim kiem video tu link: ${url}`);
    const response = await axios.get(url, { headers });
    const htmlContent = response.data;
    fs.writeFileSync('fb_response.html', htmlContent);
    const attachments = {
      videos: extractVideos(htmlContent),
      images: extractImages(htmlContent),
      stories: extractStories(htmlContent)
    };
    fs.writeFileSync('attachments.json', JSON.stringify(attachments, null, 2));
    console.log(`✅ Found attachments: ${attachments.videos.length} videos, ${attachments.images.length} images, ${attachments.stories.length} stories`);
    return attachments;
  } catch (err) {
    console.error('❌ Error occurred:', err.message);
    if (err.response) {
      console.error(`Status: ${err.response.status}`);
      fs.writeFileSync('error_response.txt', JSON.stringify(err.response.data));
    }
  }
}
function extractVideos(html) {
  const videoMap = new Map();
  const matches = [
    ...html.matchAll(/"progressive_url"\s*:\s*"([^"]+)"/g),
    ...html.matchAll(/video[^>]+src="([^"]+)"/g),
    ...html.matchAll(/"videoURL"\s*:\s*"([^"]+)"/g)
  ];
  for (const match of matches) {
    const url = match[1].replace(/\\/g, '');
    if (!url.startsWith('http')) continue;
    const quality = url.includes('hd') ? 'HD' : url.includes('sd') ? 'SD' : null;
    if (!videoMap.has(url)) {
      videoMap.set(url, { link: url, quality });
    }
  }
  return Array.from(videoMap.values());
}
function extractImages(html) {
  const imageUrls = new Set();
  const imgTags = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(m => m[1]);
  const bgImages = [...html.matchAll(/background-image\s*:\s*url\(['"]?([^'"\)]+)['"]?\)/g)].map(m => m[1]);
  const preloadedImages = [...html.matchAll(/rel="preload"\s+href="([^"]+)"\s+as="image"/g)].map(m => m[1]);
  const jsonImages = [...html.matchAll(/"image_url"\s*:\s*"([^"]+)"/g)].map(m => m[1].replace(/\\/g, ''));
  [...imgTags, ...bgImages, ...preloadedImages, ...jsonImages].forEach(url => {
    if (url && url.startsWith('http') && !url.includes('data:image')) imageUrls.add(url);
  });
  return Array.from(imageUrls);
}
function extractStories(html) {
  const storyUrls = new Set();
  const storyPreviews = [...html.matchAll(/data-preloader="adp_StoriesSuspenseContentPaneRootWithEntryPointQueryRelayPreloader[^>]+href="([^"]+)"/g)].map(m => m[1]);
  const storyLinks = [...html.matchAll(/href="(\/stories\/[^"]+)"/g)].map(m => `https://www.facebook.com${m[1]}`);
  [...storyPreviews, ...storyLinks].forEach(url => {
    if (url && url.startsWith('http')) storyUrls.add(url);
  });
  return Array.from(storyUrls);
}
getAttachments('PAST YOUR STR DO YOU WANT TO GET')
  .then(attachments => {
    console.log('🎬 Tổng số video:', attachments.videos.length);
    attachments.videos.slice(0, 3).forEach((vid, i) => {
      console.log(`${i+1}. [${vid.quality || 'N/A'}] ${vid.link.substring(0, 100)}...`);
    });
  })
  .catch(error => {
    console.error('⚠️ Unhandled error:', error);
  });
