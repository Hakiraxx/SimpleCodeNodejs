const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const getP = require('./getpuuid.js');
const nameChampion = require('./champion.json');
async function getChampionIdMap(ID) {
    return nameChampion[ID] || 'Unknown Champion';
}
function convertTimestamp(timestampMs) {
    const dateUtc = new Date(timestampMs);
    const vnOffsetMs = 7 * 60 * 60 * 1000;
    const dateVn = new Date(timestampMs + vnOffsetMs);
    return dateVn.toISOString().replace('T', ' ').slice(0, 19);
  }
async function getUserChampion(nation, puuid){
    const baseUrl = 'https://' + nation + '.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/' + puuid + '?api_key=' + config['API_KEY'];
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0",
        "Accept-Language": "en-GB,en;q=0.9,en-US;q=0.8,vi;q=0.7",
        "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
        "Origin": "https://developer.riotgames.com"
    }
    try {
        const response = await axios.get(baseUrl, { headers });
        const masteryData = await Promise.all(response.data.map(async item => {
          const championName = await getChampionIdMap(item.championId.toString());
          const lastime = convertTimestamp(item.lastPlayTime);
          
          return {
            championId: item.championId,
            championName: championName,
            championLevel: item.championLevel,
            championPoints: item.championPoints,
            lastPlayTime: lastime
          };
        }));
        masteryData.sort((a, b) => b.championPoints - a.championPoints);
        return masteryData;
    } catch (error) {
        throw new Error(`Error: ${error.response?.status || 'Unknown'} - ${error.response?.statusText || error.message}`);
    }
}
getUserChampion('vn2', 'wFuaB1r_36rYg-2L4KmbHv8UHk6AuVZ1-yDH0ML8g4uwkEiy9r6lJ5Gb-0AfaojJEgg3NUUNGKRG5A')
    .then(data => console.log(data))
    .catch(error => console.error(error));