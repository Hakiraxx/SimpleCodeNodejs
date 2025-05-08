const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}
const outputDir = './downloads';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}
const clientId = 'gqKBMSuBw5rbN9rDRYPqKNvF17ovlObu';
async function downloadTrack(trackUrl) {
  try {
    const response = await axios.get(`https://api-widget.soundcloud.com/resolve?url=${trackUrl}&format=json&&client_id=${clientId}&app_version=1746521262`);
    const data = response.data;
    const name = data['permalink']
    const outputFile = path.join(outputDir, `${name}.mp3`);
    console.log('Resolving track...');
    const resolveUrl = `https://api-v2.soundcloud.com/resolve?url=${trackUrl}&client_id=${clientId}`;
    const resolveResponse = await axios.get(resolveUrl);
    const trackId = resolveResponse.data.id;
    console.log('Getting track media URLs...');
    const trackInfoUrl = `https://api-v2.soundcloud.com/tracks/${trackId}?client_id=${clientId}`;
    const trackInfoResponse = await axios.get(trackInfoUrl);
    const transcodings = trackInfoResponse.data.media.transcodings;
    const progressive = transcodings.find(t => t.format.protocol === 'progressive');
    const hls = transcodings.find(t => t.format.protocol === 'hls');
    const transcoding = progressive || hls;
    if (!transcoding) {
      throw new Error('No suitable media format found');
    }
    console.log('Getting stream URL...');
    const mediaUrlResponse = await axios.get(`${transcoding.url}?client_id=${clientId}`);
    const streamUrl = mediaUrlResponse.data.url;
    console.log('Starting download...');
    const command = ffmpeg()
      .input(streamUrl)
      .inputOption('-referer', 'https://soundcloud.com/')
      .inputOption('-reconnect', '1')
      .inputOption('-reconnect_streamed', '1')
      .inputOption('-reconnect_delay_max', '5')
      .audioBitrate('320k')
      .audioCodec('libmp3lame')
      .audioChannels(2)
      .outputOptions('-id3v2_version 3')
      .output(outputFile);
    command.on('start', commandLine => {
      console.log('▶️ Starting ffmpeg with command:', commandLine);
    });
    command.on('progress', progress => {
      if (progress.percent) {
        process.stdout.write(`⏳ Processing: ${Math.floor(progress.percent)}%\r`);
      } else if (progress.timemark) {
        process.stdout.write(`⏳ Time processed: ${progress.timemark}\r`);
      }
    });
    command.on('end', () => {
      console.log(`\n✅ Download complete: ${outputFile}`);
    });
    command.on('error', err => {
      console.error(`\n❌ Error: ${err.message}`);
    });
    command.run();
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}
downloadTrack('https://soundcloud.com/hoanglongnger/noi');