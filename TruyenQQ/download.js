const axios = require('axios');
const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');
async function Download(url){
    const response = await axios.get(url)
    const $ = cheerio.load(response.data);
    const getChapter = $('div[class="main_content"]').find('div[class="chapter_content_div chapter_new_load"]').find('div[style="overflow: hidden;"]');
    const images = [];
    getChapter.each((index, element) => {
        const imgDivs = $(element).find('div[class="page-chapter"]');
        imgDivs.each((i, imgDiv) => {
            const imgElement = $(imgDiv).find('img');
            const src = imgElement.attr('src');
            const dataOriginal = imgElement.attr('data-original');
            const imageUrl = dataOriginal || src;
            
            if (imageUrl) {
                images.push(imageUrl);
            }
        });
    });
    const folderName = url.split('/truyen-tranh/')[1].split('.')[0];
    const downloadDir = path.join(__dirname, 'download');
    const folderPath = path.join(downloadDir, folderName);
    if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir);
    }
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }
    const headers = {
        'authority': 's135.hinhhinh.com',
        'accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'referer': 'https://truyenqqgo.com/',
    }
    for(let i = 0; i < images.length; i++){
        const imageUrl = images[i];
        const fileName = `${folderPath}/image${i + 1}.jpg`;
        const writer = fs.createWriteStream(fileName);
        const response = await axios({
            url: imageUrl,
            method: 'GET',
            responseType: 'stream',
            headers: headers
        });
        response.data.pipe(writer);
        writer.on('finish', () => {
            console.log(`Downloaded ${fileName}`);
        });
        writer.on('error', (err) => {
            console.error(`Error downloading ${fileName}:`, err);
        });
    }
}

Download().then(response => {
    console.log('ok')
}).catch(err => {
    console.error('Error fetching main page:', err);
});