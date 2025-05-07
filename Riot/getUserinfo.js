const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const getP = require('./getpuuid.js');
const puuidname = require('./puuid-cache.json')
function getNameByPUUID(puuid) {
    for (const [name, id] of Object.entries(puuidname)) {
      if (id === puuid) return name;
    }
    return null; 
  }
async function getUserinfo(region, puuid) {
    const baseUrl = 'https://' + region + '.api.riotgames.com/lol/league/v4/entries/by-puuid/' + puuid + '?api_key=' + config['API_KEY'];
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0",
        "Accept-Language": "en-GB,en;q=0.9,en-US;q=0.8,vi;q=0.7",
        "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
        "Origin": "https://developer.riotgames.com"
    }
    const response = await axios.get(baseUrl, { headers });
    const responseData = response.data;
    if (responseData.length === 0) {
        return null; // No ranked data available
    }
    const data = {};
    data['name'] = getNameByPUUID(puuid);
    data['queueType'] = responseData[0].queueType;
    data['tier'] = responseData[0].tier;
    data['rank'] = responseData[0].rank;
    data['leaguePoints'] = responseData[0].leaguePoints;
    data['wins'] = responseData[0].wins;
    data['losses'] = responseData[0].losses;
    data['winrate'] = ((responseData[0].wins / (responseData[0].wins + responseData[0].losses)) * 100).toFixed(2) + '%';
    return data;
}
getUserinfo('vn2', 'PcSbzZKaLWZ-Sl-n8IESB_VR-WZYeQotSvQcVDgFL_pqKm-icEDVxdE7VYxKFxUPJbDtEKwP2sC3yA')
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error('Error:', error.message);
    });