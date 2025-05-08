const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
function convertTime(dateStr){
     const date = new Date(dateStr);
     const options = {
     timeZone: 'Asia/Ho_Chi_Minh',
     year: 'numeric',
     month: '2-digit',
     day: '2-digit',
     hour: '2-digit',
     minute: '2-digit',
     second: '2-digit'
     };
     return date.toLocaleString('vi-VN', options);
};

async function searchTracks(tracks) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(`https://soundcloud.com/search/sounds?q=${encodeURIComponent(tracks)}`, {
        waitUntil: 'networkidle2',
        timeout: 60000
    });
    await page.waitForSelector('div#content', { timeout: 30000 });
    const contentHTML = await page.$eval('div#content', el => el.innerHTML);
    await browser.close();
    const $ = cheerio.load(contentHTML);
    const result = [];
    $('li').each((i, el) => {
        const name = $(el).find('div[class="soundTitle__usernameTitleContainer sc-mb-0.5x"] > a[class="sc-link-primary soundTitle__title sc-link-dark sc-text-h4"] > span').text().trim() || '';
        const link = $(el).find('div[class="soundTitle__usernameTitleContainer sc-mb-0.5x"] > a[class="sc-link-primary soundTitle__title sc-link-dark sc-text-h4"]').attr('href') || '';
        const timeElement = $(el).find('time.relativeTime');
        const datetime = timeElement.attr('datetime') || '';
        const postedTitle = timeElement.attr('title') || '';

       if(!name) return;
            result.push({
                name,
                link: `https://soundcloud.com${link}`,
                datetime: convertTime(datetime),
                postedTitle,
            });
        
    });
    return result;
}
searchTracks('Lạ Lùng').then(result => {
    console.log(result);
});

//node searchTracks