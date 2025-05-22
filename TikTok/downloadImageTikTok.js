const xbogus = require('xbogus');
const axios = require('axios');
const cheerio = require('cheerio');
async function fetchTikTokData() {
    const link = 'https://www.tiktok.com/@depalette/photo/7363920829224144136';
    const response = await axios.get(link, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0',
        }
    });
    const html = response.data;
    const $ = cheerio.load(html);
    const scriptContent = $('script#__UNIVERSAL_DATA_FOR_REHYDRATION__').html();
    const jsonData = JSON.parse(scriptContent);
    const data = jsonData.__DEFAULT_SCOPE__['webapp.app-context'];
    const WebIdLastTime = data.webIdCreatedTime;
    const odinId = data.odinId;
    const seoAbtest = jsonData.__DEFAULT_SCOPE__['seo.abtest'];
    const canonical = seoAbtest?.canonical || '';
    const itemId = canonical.split('/photo/')[1];
    const cookies = response.headers['set-cookie'] || [];
    const msToken = cookies.find(c => c.startsWith('msToken='))?.split(';')[0].split('=')[1] || '';
    const queryParams = {
        WebIdLastTime,
        aid: "1988",
        app_language: "en-GB",
        app_name: "tiktok_web",
        browser_language: "en-GB",
        browser_name: "Mozilla",
        browser_online: "true",
        browser_platform: "Win32",
        browser_version: "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0",
        channel: "tiktok_web",
        clientABVersions: "73675307",
        cookie_enabled: "true",
        coverFormat: "2",
        data_collection_enabled: "true",
        device_id: "7481132268917294600",
        device_platform: "web_pc",
        focus_state: "true",
        from_page: "user",
        history_len: "1",
        is_fullscreen: "false",
        is_page_visible: "true",
        itemId: itemId,
        language: "en-GB",
        odinId: odinId,
        os: "windows",
        priority_region: "",
        referer: "",
        region: "VN",
        screen_height: "864",
        screen_width: "1536",
        tz_name: "Asia/Saigon",
        user_is_login: "false",
        webcast_language: "en-GB"
    };
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(queryParams)) {
        searchParams.append(key, value);
    }
    const baseUrl = `https://www.tiktok.com/api/item/detail/?${searchParams.toString()}`;
    const xBogus = xbogus(baseUrl, queryParams.browser_version);
    searchParams.append('X-Bogus', xBogus);
    const finalUrl = `https://www.tiktok.com/api/item/detail/?${searchParams.toString()}`;
    const cookieHeader = `msToken=${msToken}; ${cookies.map(c => c.split(';')[0]).join('; ')}`;
    const result = await axios.get(finalUrl, {
        headers: {
            'User-Agent': queryParams.browser_version,
            'cookie': cookieHeader,
            'accept-language': 'en-GB,en;q=0.9',
        }
    });
    return result.data;
}
module.exports = fetchTikTokData;
//Khong chac nhma cai nay co the get dc luon ca video
