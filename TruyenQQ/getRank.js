const axios = require('axios');
const fs = require('fs');
const cheerio = require('cheerio');
async function scrapeRankPage(url) {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const rankData = [];
    const mainHome = $('div[class="main_content"]').find('div[id="main_homepage"]')
        .find('div[class="list_grid_out"]').find('ul[class="list_grid grid"]').find('li');
    mainHome.each((index, element) => {
        const title = $(element).find('div[class="book_info"]').find('div[class="book_name qtip"]').find('a').text();
        const link = $(element).find('div[class="book_info"]').find('a').attr('href');
        const lastChapter = $(element).find('div[class="book_info"]').find('div[class="last_chapter"]').find('a').text();
        const timeUpload = $(element).find('div[class="book_avatar"]').find('div[class="top-notice"]').find('span[class="time-ago"]').text();
        const img = $(element).find('div[class="book_avatar"]').find('img').attr('src');
        rankData.push({ title, link, lastChapter, timeUpload, img });
    });
    return rankData;
}

async function mainPage() {
    try {
        const dayUrl = 'https://truyenqqgo.com/top-ngay.html';
        const weekUrl = 'https://truyenqqgo.com/top-tuan.html';
        const monthUrl = 'https://truyenqqgo.com/top-thang.html';
        const [DayRank, WeekRank, MonthRank] = await Promise.all([
            scrapeRankPage(dayUrl),
            scrapeRankPage(weekUrl),
            scrapeRankPage(monthUrl)
        ]);
        return {
            DayRank,
            WeekRank,
            MonthRank
        };
    } catch (error) {
        console.error('Error fetching rank pages:', error);
        throw error;
    }
}
mainPage().then(response => {
    console.log(response)
}).catch(err => {
    console.error('Error in main process:', err);
});