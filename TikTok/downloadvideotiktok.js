const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const file = 'tiktok_videos/'
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Referer': 'https://www.tiktok.com/',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Accept-Language': 'en-US,en;q=0.9',
    'Priority': 'u=0, i',
    'Sec-Ch-Ua': '"Chromium";v="125", "Google Chrome";v="125", "Not.A/Brand";v="24"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1'
};
async function videoDownload(url) {
    try {
        console.log(`Fetching page: ${url}`);
        const response = await axios.get(url, { headers });
        const html = response.data;
        const $ = cheerio.load(html);
        const scriptContent = $('script#__UNIVERSAL_DATA_FOR_REHYDRATION__').html();
        const jsonData = JSON.parse(scriptContent);
        let videoUrl = null, id = null;
        fs.writeFileSync('data.json', JSON.stringify(jsonData, null, 2));
        try {
            videoUrl = jsonData.__DEFAULT_SCOPE__['webapp.video-detail']['itemInfo']['itemStruct']['video']['bitrateInfo'][0]['PlayAddr']['UrlList'][2];
            id = jsonData.__DEFAULT_SCOPE__['webapp.video-detail']['itemInfo']['itemStruct']['video']['id'];
        } catch (e) {
            console.log('Video URL not found in webapp.video-detail path');
        }
        try {
        console.log(`Downloading video from ${videoUrl}`);
        
        const videoResponse = await axios({
            method: 'GET',
            url: videoUrl,
            responseType: 'stream',
            headers: {
                ...headers,
                'Referer': 'https://www.tiktok.com/',
                'Range': 'bytes=0-'
            }
        });
        const writer = fs.createWriteStream(`${file}/${id}.mp4`);
        videoResponse.data.pipe(writer);
        
        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log(`Video saved to ${file + id + '.mp4'}`);
                resolve(file + id + '.mp4');
            });
            writer.on('error', reject);
        });
    } catch (error) {
        console.error('Error downloading video:', error.message);
        throw error;
    }

        throw new Error('Could not find video URL in page data');
    } catch (error) {
        console.error('Error downloading video:', error.message);
        throw error;
    }
}
async function main() {
    const videoUrl = '';
    try {
            await videoDownload(videoUrl);
            console.log('Video downloaded successfully');
    } catch (error) {
        console.error('Failed:', error.message);
    }
}
main();