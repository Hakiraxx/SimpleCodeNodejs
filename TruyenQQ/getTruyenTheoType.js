const axios = require('axios');
const fs = require('fs');
const cheerio = require('cheerio');
const type = require('./genres.json');
const { url } = require('inspector');
async function scrapeRankPage(options, page) {
    const option = type[options];
    let link;
    if (page == 1) {
        link = 'https://truyenqqgo.com' + option.link;
    } else {
        link = `https://truyenqqgo.com${option.link}/trang-${page}.html`;
    }
    const response = await axios.get(link);
    const html = response.data;
    const $ = cheerio.load(html);
    const response2 = cheerio.load((await axios.get('https://truyenqqgo.com' + option.link)).data);
    const pageRedirect = response2('div[class="page_redirect"]');
    const json = [];
    pageRedirect.find('a').each((index, element) => {
        const href = response2(element).attr('href');
        if (href && href !== 'javascript:void(0)') {
            json.push(href);
        }
    });
    const length = json[`${json.length - 1}`];
    const pageL = length.split('/')[3].split('.')[0];
    const mainHome = $('div[class="main_content"]').find('div[id="main_homepage"]').find('div[class="list_grid_out"]').find('ul[class="list_grid grid"]').find('li');
   const dataNewUpdate = []
    mainHome.each((index, element) => {
        const title = $(element).find('div[class="book_info"]').find('div[class="book_name qtip"]').find('a').text();
        const link = $(element).find('div[class="book_info"]').find('a').attr('href');
        const lastChapter = $(element).find('div[class="book_info"]').find('div[class="last_chapter"]').find('a').text();
        const timeUpload = $(element).find('div[class="book_avatar"]').find('div[class="top-notice"]').find('span[class="time-ago"]').text();
        const img = $(element).find('div[class="book_avatar"]').find('img').attr('src');
        dataNewUpdate.push({ title, link, lastChapter, timeUpload, img });
    });
    const data = {
        pagelength: pageL.replace('-', ' '),
        dataNewUpdate: dataNewUpdate
    };
   return data;
}

scrapeRankPage().then(response => {
    console.log(response)
}).catch(err => {
    console.error('Error in main process:', err);
});