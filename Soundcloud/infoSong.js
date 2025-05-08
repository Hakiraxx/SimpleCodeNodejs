const axios = require('axios');
async function getTrackInfo(trackUrl) {
    const clientId = '';

    const baseUrl = 'https://api-widget.soundcloud.com/resolve?url=' + trackUrl + '&format=json&client_id='+ clientId +'&app_version=1746521262';
    const response = await axios.get(baseUrl);
    const data = response.data;
    const timestamp = data['created_at'];
    const date = new Date(timestamp);
    const readableDate = date.toLocaleString('en-US', { timeZone: 'UTC' });
    const FinnalData = {};
    FinnalData['name'] = data['permalink'];
    FinnalData['created_at'] = readableDate;
    FinnalData['description'] = data['description'];
    FinnalData['comment_count'] = data['comment_count'];
    FinnalData['artwork_url'] = data['artwork_url'];
    return FinnalData;
}
module.exports = getTrackInfo;;