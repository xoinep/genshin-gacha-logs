const fsx = require("fs-extra");
const path = require("path");
const { URL } = require("url");
const fetch = require("electron-fetch").default;
const fastCsv = require("fast-csv");
const fs = require("fs");
const GenshinGachaServices = {};

const order = ["301", "302", "200", "100"];

GenshinGachaServices.getData = async (key, url) => {
  let gachaLogBaseUrl = `https://hk4e-api.mihoyo.com/event/gacha_info/api/getGachaLog?${url}`;
  return await getGachaLogs(key, gachaLogBaseUrl);
};

const request = async (url) => {
  const res = await fetch(url, { timeout: 15 * 1000 });
  return await res.json();
};

const getGachaLogs = async (key, url) => {
  let res = [];
  let promises = [];
  let shouldContinue = true;
  for (var i = 1; i < 20; i++) {
    promises.push(getGachaLog(key, url, i));
  }
  res = await Promise.all(promises);
  let tmp = [];
  res.map((d) => (tmp = [...tmp, ...d]));
  return tmp;
};

const getGachaLog = (key, url, page, retryCount = 3) => {
  return new Promise(async (resolve, reject) => {
    try {
      let final_url =
        url + `&gacha_type=${key}` + `&page=${page}` + `&size=${20}`;
      const res = fetch(final_url, { timeout: 15 * 1000 })
        .then((res) => {
          res.json();
        })
        .then((json) => {
          console.log("22222");
          console.log(json);
          resolve(json.data.list);
        })
        .catch((e) => console.log(e));
    } catch (error) {
      console.log(error);
      if (retryCount) {
        await sleep(5);
        retryCount--;
        return getGachaLog(key, url, page, retryCount);
      } else {
        reject(error);
      }
    }
  });
};

const sleep = (sec = 1) => {
  return new Promise((rev) => {
    setTimeout(rev, sec * 1000);
  });
};

GenshinGachaServices.loadUserData = async (userKey) => {
  const { searchParams } = new URL(userKey);
  const queryString = searchParams.toString();
  let gachaTypesUrl = `https://hk4e-api.mihoyo.com/event/gacha_info/api/getConfigList?${queryString}`;
  const res = await request(gachaTypesUrl);
  console.log(res);
  const gachaTypes = res.data.gacha_type_list;
  const orderedGachaTypes = [];
  order.forEach((key) => {
    const index = gachaTypes.findIndex((item) => item.key === key);
    if (index !== -1) {
      orderedGachaTypes.push(gachaTypes.splice(index, 1)[0]);
    }
  });
  orderedGachaTypes.push(...gachaTypes);
  console.log(orderedGachaTypes);
  return orderedGachaTypes;
};

module.exports = GenshinGachaServices;
