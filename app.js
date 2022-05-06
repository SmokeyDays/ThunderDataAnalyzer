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
    i[0] = Date.UTC(...dateArr).toString() + i[1]; //.padStart(7, "0")
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
    // now[1] = now[1] / (Math.PI) * 180;
    // now[2] = now[2] / (Math.PI) * 180;
    site[i[0].toString()][i[1].toString()] = now;
  }

  return site;
}

function analyzeGroup(str) {
  const arr = str.split("\r\n");
  let ret = [];
  for(let i = 0; i < arr.length; ++i) {
    const narr = arr[i].split("\"");
    const list = narr[1].split(/\D/).slice(0, -1);
    ret.push(list);
  }
  return ret;
}

function raw2input(val, site) {
  if(site[val[2]] == undefined || site[val[2]][val[3]] == undefined) {
    return null;
  }
  if(site[val[2]][val[3]][3] == undefined) {
    site[val[2]][val[3]][3] = 0;
  }
  let nowStr = {};
  nowStr["node"] = val[8];
  nowStr["datetime"] = val[0];
  nowStr["microsecond"] = parseInt(val[1]);
  nowStr["signal_strength"] = parseFloat(val[5]);
  nowStr["longitude"] = parseFloat(site[val[2]][val[3]][1]);
  nowStr["latitude"] = parseFloat(site[val[2]][val[3]][2]);
  ++site[val[2]][val[3]][3];
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

function biject(val) {
  let ret = {};
  for(let i = 0; i < val.length; ++i) {
    ret[val[i][8]] = val[i];
  }
  return ret;
}

function app(infoDataName, groupDataName) {
  let siteArr = csv2arr(fs.readFileSync("sitedata_" + infoDataName + ".csv", 'utf-8'));
  let rawArr = csv2arr(fs.readFileSync("rawdata_" + infoDataName + ".csv",'utf-8'));
  let groupStr = fs.readFileSync("groupdata_" + infoDataName + "_" + groupDataName + ".csv", 'utf-8'); // Column 9

  const site = analyzeSite(siteArr);
  const group = analyzeGroup(groupStr);
  const groupArr = csv2arr(groupStr);
  const groupIndex = biject(rawArr);
  let ans = [];
  let ori = [];
  for(let i = 0; i < group.length; ++i) {
    let now = [];
    for(let j = 0; j < group[i].length; ++j) {
      if(groupIndex[group[i][j]] != undefined) {
        const tmp = raw2input(groupIndex[group[i][j]], site);
        if(tmp != null){
          now.push(tmp);
        }
      }
    }
    if(now.length < 3) {
      continue;
    }
    ori.push(groupArr[i]);
    ans.push(JSON.stringify(now));
  }
  console.log(site);
  fs.writeFileSync("input_" + infoDataName + "_" + groupDataName + ".csv",ans.join("\n"));
  // fs.writeFileSync("groupdata_with_ans_" + name + ".csv",ori.join("\n"));
}

app("0819", "res")