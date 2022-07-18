let express = require('express');
let router = express.Router();
global.hr = "---";
global.lon = "---";
global.lat = "---";
global.user = "---";
var passwd = require('../passwd.json');

const client = require('prom-client');
const axios = require("axios");


let prom_lasthr = new client.Gauge({ name: 'latest_hr', help: 'Latest HR' });
let prom_lastlon = new client.Gauge({ name: 'latest_longitude', help: 'Latest Longitude' });
let prom_lastlat = new client.Gauge({ name: 'latest_latitude', help: 'Latest Latitude' });

router.all('/load', async function (req, res, next) {
  global.logger.log("info", "Recieving load gen message...");
  if (passwd.password != req.query.password) {
    res.write("User " + req.user + " unauthorized.");
    res.end();
    global.logger.log("error", "Authentication failed for: " + req.query.user);

    return;
  }
  let obj = new Object();
  obj.heartrate = req.query.heartrate
  obj.location = req.query.location;
  obj.color = req.query.color;
  obj.user = req.query.user;
  obj.event_timestamp = req.query.event_timestamp;
  obj.id = req.query.id;
  obj.deviceid = req.query.deviceid;

  let retcode= 200;
  let retstring= "OK.\n";
  if(!(process.env.NOLISTENER=="true")) {
  try {
    result = await axios.post(process.env.LISTENER, JSON.stringify(obj));
    global.logger.log("info", "Sent message to Listener: " + JSON.stringify(obj));
  }
  catch (err) {
    retstring= "Error.\n"
    retcode= result.response.status;
    global.logger.log("error", "Can't post data to Listener " + process.env.LISTENER + " " + JSON.stringify(obj) + " " + err);
  }
  }
  res.write(retstring);
  res.status(retcode);
  res.end();
  if(retcode==200)
    global.logger.log("info", "Message successfully handled.");
  else
  global.logger.log("error", "Can't send message to listener or listener returns error.");
});

router.all('/', async function (req, res, next) {
  global.logger.log("info", "Recieving message...");

  if (passwd.password != req.query.password) {
    res.write("User " + req.user + " unauthorized.");
    res.end();
    global.logger.log("error", "Authentication failed for: " + req.query.user);

    return;
  }
  global.logger.log("info", "User " + req.query.user + " authenticated.");

  if (req.query.user.length > 12) {
    global.logger.log("info", "User name " + req.query.user + " changed to 'Me'.");
    req.query.user = "Me";
  }
  global.hr = req.query.hr;
  global.lon = req.query.lon;
  global.lat = req.query.lat;
  global.user = req.query.user;



  prom_lasthr.set(parseFloat(global.hr));
  prom_lastlon.set(parseFloat(global.lon));
  prom_lastlat.set(parseFloat(global.lat));

  //console.log(req.query)
  let obj = new Object();
  obj.hr = global.hr;
  obj.lon = global.lon;
  obj.lat = global.lat;
  obj.user = req.query.user;

  let eo = new Object();
  eo.hr = global.hr;
  eo.lon = global.lon;
  eo.lat = global.lat;
  eo.user = req.query.user;

  global.logger.log("info", "Websocket emit: " + JSON.stringify(eo));
  io.emit("garmin", eo);

  obj.heartrate = parseInt(obj.hr);
  obj.deviceid = obj.user;
  obj.location = obj.lon + "," + obj.lat;
  if (obj.location.includes("---")) {
    obj.location = "-122.957359,50.116322";
    global.logger.log("info", "No location info, setting to: '-122.957359,50.116322'");
  }

  let d = new Date();
  let day = d.getUTCDate();
  let daystring = "" + day;

  if (day < 10)
    daystring = "0" + daystring;
  let month = d.getUTCMonth() + 1;
  let monthstring = "" + month;
  if (month < 10)
    monthstring = "0" + monthstring;

  let hour = d.getUTCHours();
  let hourstring = "" + hour;
  if (hour < 10)
    hourstring = "0" + hourstring;

  let minute = d.getUTCMinutes();
  let minutestring = "" + minute;
  if (minute < 10)
    minutestring = "0" + minutestring;

  let second = d.getUTCSeconds() + d.getUTCMilliseconds() / 1000.0;
  let secondstring = "" + second;
  if (second < 10)
    secondstring = "0" + secondstring


  obj.event_timestamp = d.getFullYear() + "-" + monthstring + "-" + daystring + "T" + hourstring + ":" + minutestring + ":" + secondstring + "Z";
  obj.id = d.getTime();
  obj.color = "0x80FFFFFF";
  obj.deviceid = "245";

  if (obj.user.length > 8)
    obj.user = obj.user.substring(0, 7)

  delete obj.lon;
  delete obj.lat;
  delete obj.hr;

  try {
    result = await axios.post(process.env.LISTENER, JSON.stringify(obj));
    global.logger.log("info", "Sent message to Listener: " + JSON.stringify(obj));

  }
  catch (err) {
    global.logger.log("error", "Can't post data to Listener " + process.env.LISTENER + " " + JSON.stringify(obj) + " " + err);
  }

  res.write("OK.\n");
  res.end();
  global.logger.log("info", "Message successfully handled.");
});


module.exports = router;
