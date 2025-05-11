const axios = require('axios');
const fs = require('fs');
const cookietxt = fs.readFileSync('cookie.txt', 'utf-8');
async function getAppID(url) {
    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.2592.87',
            'sec-fetch-mode': 'navigate',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'cookie': cookietxt
        };
        const getContent = async (url, headers) => {
            const response = await axios.get(url, { headers });
            return response.data;
        };
        const r1 = (regex, str) => {
            const match = str.match(regex);
            return match ? match[1] : null;
        };
        url = r1(/([^?]*)/, url) || url;
        const content = await getContent(url, headers);
        const appId = r1(/"appId":"(\d+)"/, content);
        const mediaId = r1(/"media_id":"(\d+)"/, content) || r1(/"id":"(\d+_\d+)"/, content);
        if (!appId || !mediaId) {
            fs.writeFileSync('instagram_response.html', content);
            throw new Error("Failed to extract appId or mediaId from the Instagram page");
        }
        return { appId, mediaId};
    } catch (error) {
        throw error;
    }
}
async function downloadAnyoneInInsta(link) {
    const { appId, mediaId } = await getAppID(link);
    const mediaUrl = `https://i.instagram.com/api/v1/media/${mediaId}/info/`;
    try {
        const mediaCheck = await axios.get(mediaUrl, {
            headers: {
                'X-IG-App-ID': appId,  
                'Cookie': cookietxt,  
            },
        });
        const data = mediaCheck.data;
        const item = data.items[0];
        
        const result = {
            Caption: item.caption ? item.caption.text : '',
            User: item.caption ? {
                full_name: item.caption.user.full_name,
                UserName: item.caption.user.username
            } : {},
            media: []
        };
        if (item.carousel_media && item.carousel_media.length > 0) {
            const length = item.carousel_media.length;
            
            for (let i = 0; i < length; i++) {
                const mediaItem = item.carousel_media[i];
                const mediaObj = { index: i };
                
                if (mediaItem.image_versions2 && mediaItem.image_versions2.candidates && mediaItem.image_versions2.candidates.length > 0) {
                    mediaObj.type = 'image';
                    mediaObj.url = mediaItem.image_versions2.candidates[0].url;
                }
                
                if (mediaItem.video_versions && mediaItem.video_versions.length > 0) {
                    mediaObj.type = 'video';
                    mediaObj.url = mediaItem.video_versions[0].url;
                    
                    if (mediaItem.image_versions2 && mediaItem.image_versions2.candidates && mediaItem.image_versions2.candidates.length > 0) {
                        mediaObj.thumbnail = mediaItem.image_versions2.candidates[0].url;
                    }
                }
                result.media.push(mediaObj);
            }
        } else {
            const mediaObj = {};
            
            if (item.image_versions2 && item.image_versions2.candidates && item.image_versions2.candidates.length > 0) {
                mediaObj.type = 'image';
                mediaObj.url = item.image_versions2.candidates[0].url;
            }
            if (item.video_versions && item.video_versions.length > 0) {
                mediaObj.type = 'video';
                mediaObj.url = item.video_versions[0].url;
                if (item.image_versions2 && item.image_versions2.candidates && item.image_versions2.candidates.length > 0) {
                    mediaObj.thumbnail = item.image_versions2.candidates[0].url;
                }
            }
            result.media.push(mediaObj);
        }
        return result;
    } catch (error) {
        throw error;
    }
}
downloadAnyoneInInsta('').then((data) => {
    console.log(data);
}).catch((error) => {
    console.error(error);
});