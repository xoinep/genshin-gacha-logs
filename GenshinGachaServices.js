const fsx = require("fs-extra");
const path = require("path");
const { URL } = require("url");
const fetch = require("electron-fetch").default;
const fastCsv = require("fast-csv");
const fs = require("fs");
const GenshinGachaServices = {};
let GachaTypesUrl = "";
let GachaLogBaseUrl = "";
const order = ["301", "302", "200", "100"];

GenshinGachaServices.getData = async (logText) => {
  const arr = logText.match(
    /^OnGetWebViewPageFinish:https:\/\/.+\?.+?(?:#.+)?$/gm
  );
  if (arr && arr.length) {
    let url = arr[arr.length - 1].replace("OnGetWebViewPageFinish:", "");
    const { searchParams } = new URL(url);
    const queryString = searchParams.toString();
    GachaTypesUrl = `https://hk4e-api.mihoyo.com/event/gacha_info/api/getConfigList?${queryString}`;
    GachaLogBaseUrl = `https://hk4e-api.mihoyo.com/event/gacha_info/api/getGachaLog?${queryString}`;
    const res = await request(GachaTypesUrl);
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
    let result = [];
    for (const item of orderedGachaTypes) {
      let logs = await getGachaLogs(item.key, item.name);
      result = [...result, ...logs];
    }
    // console.log(result);
    // const ws = fs.createWriteStream(`output.csv`);
    // fastCsv.write(result, { headers: true }).pipe(ws);
    return result;
  }
};

const request = async (url) => {
  const res = await fetch(url, { timeout: 15 * 1000 });
  return await res.json();
};

const getGachaLogs = async (key, name) => {
  let page = 1;
  let res = [];
  let shouldContinue = true;
  while (shouldContinue) {
    let tempRes = await getGachaLog(key, name, page);
    if (tempRes.length > 0) {
      res = [...res, ...tempRes];
      page++;
    } else {
      shouldContinue = false;
    }
  }
  return res;
};

const getGachaLog = async (key, name, page, retryCount = 3) => {
  try {
    let url =
      GachaLogBaseUrl + `&gacha_type=${key}` + `&page=${page}` + `&size=${20}`;
    const res = await request(url);
    return res.data.list;
  } catch (error) {
    if (retryCount) {
      await sleep(5);
      retryCount--;
      return await getGachaLog(key, page, name, retryCount);
    } else {
      throw e;
    }
  }
};

const sleep = (sec = 1) => {
  return new Promise((rev) => {
    setTimeout(rev, sec * 1000);
  });
};

module.exports = GenshinGachaServices;
