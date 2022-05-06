const fs = require("fs");

function csv2arr(str, div) {
  str = str.split("\n");
  let arr = [];
  for(const i of str) {
    const now = i.split(div);
    now.forEach( (e) => {
      e.trim();
    })
    arr.push(now);
  }
  return arr;
}

function euclideanDistance(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}
 
/** 
* approx distance between two points on earth ellipsoid 
* @param {Object} lat1 
* @param {Object} lng1 
* @param {Object} lat2 
* @param {Object} lng2 
*/ 
const EARTH_RADIUS = 6378137.0; //单位M
const PI = Math.PI;

function getRad(d){
  return d*PI/180.0;
}
function getFlatternDistance(lat1,lng1,lat2,lng2){ 
  var f = getRad((lat1 + lat2)/2); 
  var g = getRad((lat1 - lat2)/2); 
  var l = getRad((lng1 - lng2)/2); 
  
  var sg = Math.sin(g); 
  var sl = Math.sin(l); 
  var sf = Math.sin(f); 
  
  var s,c,w,r,d,h1,h2; 
  var a = EARTH_RADIUS; 
  var fl = 1/298.257; 
  
  sg = sg*sg; 
  sl = sl*sl; 
  sf = sf*sf; 
  
  s = sg*(1-sl) + (1-sf)*sl; 
  c = (1-sg)*(1-sl) + sf*sl; 
  
  w = Math.atan(Math.sqrt(s/c)); 
  r = Math.sqrt(s*c)/w; 
  d = 2*w*a; 
  h1 = (3*r -1)/2/c; 
  h2 = (3*r +1)/2/s; 
  
  return d*(1 + fl*(h1*sf*(1-sg) - h2*(1-sf)*sg)); 
} 
  
function getDis(pos1, pos2) {
  return getFlatternDistance(pos1.x, pos1.y, pos2.x, pos2.y);
}

function compare_without_time(name) {
  let outputArr = csv2arr(fs.readFileSync("out" + name + ".csv",'utf-8'), ", ");
  let resArr = csv2arr(fs.readFileSync("result.csv","utf-8"), ",");
  let count = 0;
  let p = 0;
  for(let j = 0; j < resArr.length; ++j) {
    for(let i = 0; i < outputArr.length; ++i) {
      const dis = getDis({x: parseFloat(outputArr[i][0]), y: parseFloat(outputArr[i][1])},{x: parseFloat(resArr[j][2]), y: parseFloat(resArr[j][3])}) / 1000;
      // console.log(dis);
      if(dis <= 2) {
        p = j + 1;
        ++count;
        break;
      }
    }
  }
  console.log(count);
}

function compare_with_time(name) {
  let outputArr = csv2arr(fs.readFileSync("output_" + name + ".csv",'utf-8'), ", ");
  let resArr = csv2arr(fs.readFileSync("result.csv","utf-8"), ",");
  // let inputArr = csv2arr(fs.readFileSync("input_" + name + ".csv", "utf-8"), "\"");
  // for(let i = 0; i < outputArr.length; ++i) {
  //   outputArr[i][0] = inputArr[i][7];
  // }
  let count = 0;
  let alldata = [];
  for(let i = 0; i < outputArr.length; ++i) {
    for(let j = 0; j < resArr.length; ++j) {
      if(outputArr[i][0] != resArr[j][0]) {
        continue;
      }
      if(outputArr[i][1] > 1e8) {
        outputArr[i][1] -= 1e8;
      }
      if(Math.abs(parseFloat(outputArr[i][1]) - parseFloat(resArr[j][1])) > 10000) {
        continue;
      }
      const dis = getDis({x: parseFloat(outputArr[i][2]), y: parseFloat(outputArr[i][3])},{x: parseFloat(resArr[j][2]), y: parseFloat(resArr[j][3])}) / 1000;
      // console.log(dis)
      if(dis <= 2) {
        // console.log({x: parseFloat(outputArr[i][2]), y: parseFloat(outputArr[i][3])},{x: parseFloat(resArr[j][2]), y: parseFloat(resArr[j][3])});
        alldata.push(outputArr[i]);
        ++count;
        alldata.push(outputArr[i]);
        break;
      }
    }
  }
  console.log(count);
  fs.writeFileSync("groupdata_" + name + ".csv", alldata.join("\n"));
}

function compare_gd_and_out(name) {
  let outputArr = csv2arr(fs.readFileSync("groupdata_" + name + ".csv",'utf-8'), ",");
  let groupansArr = csv2arr(fs.readFileSync("result.csv","utf-8"), ",");
}

function compare_wg_and_my(name) {
  let wgArr = csv2arr(fs.readFileSync("groupdata_" + name + ".csv",'utf-8'), ",");
  let myArr = csv2arr(fs.readFileSync("0316" + name + ".out","utf-8"), ", ");
  let count = 0;
  let diff = [];
  for(let i = 0; i < wgArr.length; ++i) {
    const time = Math.abs(parseFloat(wgArr[i][2]) - parseFloat(myArr[i][1]));
    const dis = getDis({x: parseFloat(wgArr[i][3]), y: parseFloat(wgArr[i][4])},{x: parseFloat(myArr[i][3]), y: parseFloat(myArr[i][2])}) / 1000;
    diff.push([time, dis].join(","));
    if(dis <= 2) {
      ++count;
    }
  }
  console.log(count);
  fs.writeFileSync("diff_wg_and_my.csv",diff.join("\n"));
}

compare_with_time("new_sys");
// console.log(getDis({x: 30.466259, y: 114.47865},{x: 30.477831, y: 114.413693}) / 1000);