const axios = require('axios');
const fs = require('fs');
const headers = {
    "sec-fetch-user": "?1",
    "sec-ch-ua-mobile": "?0",
    "sec-fetch-site": "none",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "cache-control": "max-age=0",
    authority: "www.facebook.com",
    cookie: "PASTE_YOUR_COOKIE_HERE", // ⚠️ Never share this publicly || Paste your cookie here to use it !
    "upgrade-insecure-requests": "1",
    "accept-language": "en-GB,en;q=0.9,tr-TR;q=0.8,tr;q=0.7,en-US;q=0.6",
    "sec-ch-ua": '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
};
async function getVideo(url) {
    return new Promise((resolve, reject) => {
        axios({
            method: 'GET',
            url: url,
            headers: headers
        }).then((rawResponse) => {
            try {
                const data = rawResponse.data;
                const match = data.match(/"progressive_urls":\s*(\[[\s\S]*?\])/);
                if (!match) return reject("No video URLs found!");
                const progressiveArray = JSON.parse(match[1]);
                const urlsWithMetadata = progressiveArray.map(item => ({
                    url: item.progressive_url,
                    quality: item.metadata ? item.metadata.quality : 'Unknown'
                }));
                resolve(urlsWithMetadata); 
            } catch (err) {
                reject(err);
            }
        }).catch(reject);
    });
}
getVideo('TYPE_YOUR_VIDEO_URL_HERE')
    .then((data) => {
        console.log('Video URLs:', data);
    })
    .catch((err) => {
        console.error('Error:', err);
    });
