const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
function convertTimestampToDate(timestamp) {
  const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const year = date.getFullYear(); // Get the full year
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${day}:${month}:${year} ${hours}:${minutes}:${seconds}`;
}
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
async function getinfo(url){
    console.log(`Fetching page: ${url}`);
    const response = await axios.get(url, { headers });
    const html = response.data;
    const $ = cheerio.load(html);
    const scriptContent = $('script#__UNIVERSAL_DATA_FOR_REHYDRATION__').html();
    const jsonData = JSON.parse(scriptContent);
    const info = jsonData.__DEFAULT_SCOPE__['webapp.user-detail']['userInfo']
    const json = {}
    json['id'] = info.user['id']
    json['nickname'] = info.user['nickname']
    json['signature'] = info.user['signature']
    json['avatar'] = info.user['avatarLarger']
    json['create_time'] = convertTimestampToDate(info.user['createTime'])
    json['follower_count'] = info.statsV2['followerCount']
    json['following_count'] = info.statsV2['followingCount']
    json['heart_count'] = info.statsV2['heartCount']
    json['video_count'] = info.statsV2['videoCount']
    json['is_verified'] = info.user['verified']
    console.log(json)
}
getinfo('')