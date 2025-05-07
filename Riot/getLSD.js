const axios = require('axios');
const { API_KEY } = require('./config.json');
const fs = require('fs');
const getP = require('./getpuuid.js');
async function getLSD(region, puuid) {
    const baseUrl = 'https://' + region + '.api.riotgames.com/lol/match/v5/matches/by-puuid/' + puuid + '/ids?start=0&count=10&api_key=' + API_KEY;
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0",
        "Accept-Language": "en-GB,en;q=0.9,en-US;q=0.8,vi;q=0.7",
        "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
        "Origin": "https://developer.riotgames.com"
    };
    try {
        const response = await axios.get(baseUrl, { headers });
        return response.data;
    } catch (error) {
        throw new Error(`Error: ${error.response?.status || 'Unknown'} - ${error.response?.statusText || error.message}`);
    } 
}
module.exports.getLSD = getLSD;