const axios = require('axios');
const fs = require('fs');
const cookietxt = fs.readFileSync('cookie.txt', 'utf-8');

async function get_instagram_username(link) {
    try {
        const regex = /instagram\.com\/([A-Za-z0-9_.]+)/;
        const match = link.match(regex);
        if (match && match[1]) {
            return match[1];
        } else {
            throw new Error("Could not extract username from URL");
        }
    } catch (error) {
        throw error;
    }
}

async function get_instagram_user_id(username) {
    try {
        const url = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 105.0.0.11.118 (iPhone11,8; iOS 12_3_1; en_US; en-US; scale=2.00; 828x1792; 165586599)',
                'Accept': '*/*',
                'Cookie': cookietxt
            }
        });
        
        if (response.data && response.data.data && response.data.data.user) {
            const fullData = response.data.data.user;
            const mainData = {};
           mainData['FullName'] = fullData['full_name'];
           mainData['userName'] = fullData['username']
           mainData['bio'] = fullData['biography'];
           mainData['followed'] = fullData.edge_followed_by.count;
           mainData['follow'] = fullData.edge_follow.count;
           mainData['Picture'] = fullData.profile_pic_url_hd;
           mainData['biolink'] = fullData.bio_links;
            return mainData
        } else {
            throw new Error("User ID not found in response");
        }
    } catch (error) {
        throw error;
    }
}

// Example usage
get_instagram_username('https://www.instagram.com/sovsii.vamvo/').then(username => {
        return get_instagram_user_id(username);
    }).then(userData => {
        console.log(userData);
    })
    .catch(error => {
        console.error("Error:", error.message);
    });