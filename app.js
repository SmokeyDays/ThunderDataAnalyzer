const fs = require("fs");

const CASE_NUM_MAX = 10;

function csv2arr(str) {
  str = str.split("\r\n");
  let arr = [];
  for(const i of str) {
    arr.push(i.split(","));
  }
  return arr;
}

function dateSort(arr) {
  for(const i of arr) {
    let dateStr = i[0];
    const dateArr = dateStr.split(/\D/);
    i[0] = Date.UTC(...dateArr).toString() + i[1];
  }
  arr.sort((A, B) => {
    parseInt(A[0]) - parseInt(B[0]);
  });
}

function dataDiv(arr) {
  let res = [];
  let tot = 0;
  for(let i = 0; i < arr.length; ++i) {
    if(i == 0 || arr[i][0] - arr[i-1][0] > 30000) {
      ++tot;
      res[tot - 1] = [];
    }
    res[tot - 1].push(arr[i]);
  }
  return res;
}

function analyzeSite(arr) {
  let site = {};
  for(const i of arr) {
    if(site[i[0].toString()] == undefined) {
      site[i[0].toString()] = {};
    }
    let now = i.slice(2);
    now[1] = now[1] / (Math.PI) * 180;
    now[2] = now[2] / (Math.PI) * 180;
    site[i[0].toString()][i[1].toString()] = now;
  }

  return site;
}

function analyzeGroup(arr) {
  let ret = [];
  for(let i = 0; i < arr.length; ++i) {
    const list = arr[i][9].split(",");
    ret.push(list);
  }
  return ret;
}

function raw2input(val, site) {
  let nowStr = {};
  nowStr["node"] = val[8];
  nowStr["datetime"] = val[0] + val[1];
  nowStr["microsecond"] = parseInt(val[1]);
  nowStr["signal_strength"] = parseFloat(val[5]);
  nowStr["longitude"] = parseFloat(site[val[2]][val[3]][1]);
  nowStr["latitude"] = parseFloat(site[val[2]][val[3]][2]);
  return nowStr;
}

function analyzeRaw(arr, site) {
  arr.sort((A, B) => {
    return 0.5 - Math.random();
  });
  let vis = {};
  let output = [];
  let cnt = 0;
  const tot = 40;
  for(const i of arr) {
    ++cnt;
    if(cnt >= tot){
      break;
    }
    if(site[i[2]] == undefined || site[i[2]][i[3]] == undefined) {
  //      throw new Error("Site not found");
      continue;
    }
    if(vis[i[2]] == undefined) {
      vis[i[2]] = {};
    }
    if(vis[i[2]][i[3]] == undefined) {
      let nowStr = raw2input(i, site);
      output.push(nowStr);
      vis[i[2]][i[3]] = 1;
    }
  }

  return output;
}


function app() {
  let siteArr = csv2arr(fs.readFileSync("sitedata.csv", 'utf-8'));
  let rawArr = csv2arr(fs.readFileSync("rawdata.csv",'utf-8'));
  let groupArr = csv2arr(fs.readFileSync("groupdata.csv",'utf-8')); // Column 9

  const site = analyzeSite(siteArr);
  const group = analyzeGroup(groupArr);
  dateSort(rawArr);
  const task = dataDiv(rawArr);
  let ans = [];
  for(let i = 0; i < task.length; ++i) {
    if(analyzeRaw(task[i], site).length <= 3) {
      continue;
    }
    // let ans = [];
    for(let j = 0; j < CASE_NUM_MAX; ++j) {
      const raw = analyzeRaw(task[i], site);
      ans.push(JSON.stringify(raw));
    }
    // fs.writeFileSync("./res/input_" + i + ".csv", ans.join("\n"));
  }
  ans.sort((A,B) => {
    return 0.5 - Math.random();
  })
  fs.writeFileSync("input_comp.csv",ans.slice(0,10000).join("\n"));
}

app();