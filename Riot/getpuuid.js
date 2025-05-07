const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
module.exports.getPuuid = async function getPuuid(region, username, tagname) {
    const cachePath = path.join(__dirname, 'puuid-cache.json');
    const userKey = `${username}#${tagname}`;
    let cache = {};
    try {
        if (fs.existsSync(cachePath)) {
            const cacheData = fs.readFileSync(cachePath, 'utf8');
            cache = JSON.parse(cacheData);
        }
    } catch (error) {
        console.warn('Failed to load cache:', error.message);
    }
    if (cache[userKey]) {
        return cache[userKey];
    }
    console.log('Fetching puuid from API for', userKey);
    const baseUrl = 'https://' + region + '.api.riotgames.com/riot/account/v1/accounts/by-riot-id/' + encodeURIComponent(username) + '/' + encodeURIComponent(tagname) + '?api_key=' + config['API_KEY'];
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0",
        "Accept-Language": "en-GB,en;q=0.9,en-US;q=0.8,vi;q=0.7",
        "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
        "Origin": "https://developer.riotgames.com"
    };
    const response = await axios.get(baseUrl, { headers });
    if (response.status === 200) {
        const puuid = response.data.puuid;
        cache[userKey] = puuid;
        try {
            fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
        } catch (error) {
        }
        return puuid;
    } else {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }
}
