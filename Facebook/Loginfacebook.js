const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const { stringify } = require('querystring');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
function encodesig(data) {
  const sortedData = Object.entries(data).sort();
  const encodedData = sortedData.map(([k, v]) => `${k}=${v}`).join('&');
  return crypto.createHash('sha256').update(encodedData).digest('hex');
}
function jso(data1) {
  const accessToken = data1.access_token;
  let cookie = '';
  for (const i of data1.session_cookies) {
    cookie += `${i.name}=${i.value};`;
  }
  return {
    access_token: accessToken,
    Cookie: cookie
  };
}
const username = "";
const password = "";
const auth = ""; 
async function login() {
  const session = axios.create();
  const username = username;
  const password = password;
  const auth = auth;
  const machine = Array.from({ length: 24 }, () =>
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(Math.floor(Math.random() * 62))
  ).join('');
  const form = {
    adid: uuidv4(),
    email: username,
    password: password,
    format: 'json',
    device_id: uuidv4(),
    cpl: 'true',
    family_device_id: uuidv4(),
    locale: 'en_US',
    client_country_code: 'US',
    credentials_type: 'device_based_login_password',
    generate_session_cookies: '1',
    generate_analytics_claim: '1',
    generate_machine_id: '1',
    currently_logged_in_userid: '0',
    try_num: '1',
    enroll_misauth: 'false',
    meta_inf_fbmeta: 'NO_FILE',
    source: 'login',
    machine_id: machine,
    fb_api_req_friendly_name: 'authenticate',
    fb_api_caller_class: 'com.facebook.account.login.protocol.Fb4aAuthHandler',
    api_key: '882a8490361da98702bf97a021ddc14d',
    access_token: '256002347743983|374e60f8b9bb6b8cbb30f78030438895'
  };
  form.sig = encodesig(form);
  let res1;
  try {
    res1 = await session.post('https://b-graph.facebook.com/auth/login', stringify(form), {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'user-agent': 'Mozilla/5.0 (Linux; Android 13...)',
        'x-fb-http-engine': 'Liger'
      }
    });
  } catch (err) {
    res1 = err.response;
  }

  if (res1.status === 200 && !res1.data.error) {
    return jso(res1.data);
  } else {
    const err = res1.data.error.error_data;
    const toptvip = await axios.get(`https://2fa.live/tok/${auth.replace(/\s+/g, '').toLowerCase()}`);
    form.twofactor_code = toptvip.data.token;
    form.encrypted_msisdn = '';
    form.userid = err.uid;
    form.machine_id = err.machine_id;
    form.first_factor = err.login_first_factor;
    form.credentials_type = 'two_factor';
    await delay(2000);
    delete form.sig;
    form.sig = encodesig(form);

    const res2 = await session.post('https://b-graph.facebook.com/auth/login', stringify(form), {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'user-agent': 'Mozilla/5.0 (Linux; Android 13...)',
        'x-fb-http-engine': 'Liger'
      }
    });
    return jso(res2.data);
  }
}
module.exports = login;
