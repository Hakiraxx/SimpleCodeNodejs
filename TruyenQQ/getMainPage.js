const axios = require('axios');
const fs = require('fs');
const cheerio = require('cheerio');
async function mainPage(){
    const url = 'https://truyenqqgo.com/'
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const suggests = $('div[class="main_content"]').find('div[id="div_suggest"]').find('ul[id="list_suggest"]').find('li');
    const dataSuggest = [];
    const dataNewUpdate = []
    suggests.each((index, element) => {
        const title = $(element).find('div[class="book_info"]').find('h3[itemprop="name"]').find('a').text();
        const link = $(element).find('div[class="book_info"]').find('a').attr('href');
        const lastChapter = $(element).find('div[class="book_info"]').find('div[class="last_chapter"]').find('a').text();
        const timeUpload = $(element).find('div[class="book_avatar"]').find('div[class="top-notice"]').find('span[class="time-ago"]').text();
        const img = $(element).find('div[class="book_avatar"]').find('img').attr('src');
        dataSuggest.push({ title, link, lastChapter, timeUpload, img });
    });
   const mainHome = $('div[class="main_content"]').find('div[id="main_homepage"]').find('div[class="list_grid_out"]').find('ul[class="list_grid grid"]').find('li');
   mainHome.each((index, element) => {
        const title = $(element).find('div[class="book_info"]').find('div[class="book_name qtip"]').find('a').text();
        const link = $(element).find('div[class="book_info"]').find('a').attr('href');
        const lastChapter = $(element).find('div[class="book_info"]').find('div[class="last_chapter"]').find('a').text();
        const timeUpload = $(element).find('div[class="book_avatar"]').find('div[class="top-notice"]').find('span[class="time-ago"]').text();
        const img = $(element).find('div[class="book_avatar"]').find('img').attr('src');
        dataNewUpdate.push({ title, link, lastChapter, timeUpload, img });
    });
    return {
        dataNewUpdate, 
        dataSuggest
    };
    
}
mainPage().then(response => {

}).catch(err => {
    console.error('Error fetching main page:', err);
});