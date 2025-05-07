const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const getP = require('./getpuuid.js');
const getLSD = require('./getLSD.js');
const nameChampion = require('./champion.json');
async function getChampionIdMap(ID) {
  return nameChampion[ID] || `Unknown (${ID})`;
}
function convertTimestamp(timestampMs) {
  const dateUtc = new Date(timestampMs);
  const vnOffsetMs = 7 * 60 * 60 * 1000;
  const dateVn = new Date(timestampMs + vnOffsetMs);
  return dateVn.toISOString().replace('T', ' ').slice(0, 19);
}
function formatSeconds(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const hh = String(hrs).padStart(2, '0');
  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}
async function getMatch(nation, MatchID) {
  const baseUrl = `https://${nation}.api.riotgames.com/lol/match/v5/matches/${MatchID}?api_key=${config['API_KEY']}`;
  const headers = {
    "User-Agent": "Mozilla/5.0",
    "Accept-Language": "en-GB,en;q=0.9",
    "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
    "Origin": "https://developer.riotgames.com"
  };
  try {
    const [championMap, response] = await Promise.all([
      getChampionIdMap(),
      axios.get(baseUrl, { headers })
    ]);
    const finallData = {};
    const data = response.data;
    const info = data.info;
    finallData['gameResult'] = info.gameResult;
    finallData['Creation'] = convertTimestamp(info.gameCreation);
    finallData['End'] = convertTimestamp(info.gameEndTimestamp);
    finallData['Duration'] = formatSeconds(info.gameDuration);
    finallData['GameMode'] = info.gameMode;
    const participants = info.participants;
    const yourData = participants.find(p => p.puuid === response.data.metadata.participants[0]);
    const yourTeamId = yourData.teamId;
    const yourTeam = participants.filter(p => p.teamId === yourTeamId);
    const enemyTeam = participants.filter(p => p.teamId !== yourTeamId);
    const teams = info.teams;
    const bannedChampionsByTeam = {};
    for (const team of teams) {
      const teamId = team.teamId;
      bannedChampionsByTeam[teamId] = [];

      for (const ban of team.bans) {
        const name = await getChampionIdMap(ban.championId);
        bannedChampionsByTeam[teamId].push({
          name,
          pickTurn: ban.pickTurn,
          championId: ban.championId
        });
      }
    }
    finallData['yourTeam'] = yourTeam.map(p => ({
      championName: p.championName,
      kills: p.kills,
      deaths: p.deaths,
      assists: p.assists,
      totalDamageDealtToChampions: p.totalDamageDealtToChampions,
      totalDamageTaken: p.totalDamageTaken,
      wardsPlaced: p.wardsPlaced,
      wardsKilled: p.wardsKilled,
      goldEarned: p.goldEarned,
      cs: p.totalMinionsKilled + p.neutralMinionsKilled
    }));
    finallData['enemyTeam'] = enemyTeam.map(p => ({
      championName: p.championName,
      kills: p.kills,
      deaths: p.deaths,
      assists: p.assists,
      totalDamageDealtToChampions: p.totalDamageDealtToChampions,
      totalDamageTaken: p.totalDamageTaken,
      wardsPlaced: p.wardsPlaced,
      wardsKilled: p.wardsKilled,
      goldEarned: p.goldEarned,
      cs: p.totalMinionsKilled + p.neutralMinionsKilled
    }));
    finallData['BannedChampions'] = bannedChampionsByTeam;
    return finallData;
  } catch (error) {
    throw new Error(`Error: ${error.response?.status || 'Unknown'} - ${error.response?.statusText || error.message}`);
  }
}
module.exports.getMatch = getMatch;
