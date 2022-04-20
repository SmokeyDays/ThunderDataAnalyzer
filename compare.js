const fs = require("fs");

function csv2arr(str, div) {
  str = str.split("\r\n");
  let arr = [];
  for(const i of str) {
    arr.push(i.split(div));
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

function compare(name) {
  let outputArr = csv2arr(fs.readFileSync(name + ".out",'utf-8'), ", ");
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

compare("0316base");
compare("0316li")