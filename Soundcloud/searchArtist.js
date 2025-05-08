const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
async function searchArtist(artist) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(`https://soundcloud.com/search/people?q=${encodeURIComponent(artist)}`, {
        waitUntil: 'networkidle2',
        timeout: 60000
    });
    await page.waitForSelector('div#content', { timeout: 30000 });
    const contentHTML = await page.$eval('div#content', el => el.innerHTML);
    await browser.close();
    const $ = cheerio.load(contentHTML);
    const result = [];
    $('li').each((i, el) => {
        const href = $(el).find('a').attr('href') || '';
        const name = $(el).find('a[class="sc-link-dark sc-link-primary"]').text().trim() || '';
        const follower = $(el).find('span[class="sc-visuallyhidden"]').text().trim() || '';
        if (href && name) {
            result.push({
                href,
                name,
                follower
            });
        }
    });
    return result;
}
module.exports = searchArtist;