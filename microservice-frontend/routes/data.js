let express = require('express');
let router = express.Router();
global.hr= "---";
global.lon= "---";
global.lat= "---";
global.user= "---";
var passwd= require('../passwd.json');

const client = require('prom-client');
const axios = require("axios");


let  prom_lasthr = new client.Gauge({ name: 'latest_hr', help: 'Latest HR' });
let  prom_lastlon = new client.Gauge({ name: 'latest_longitude', help: 'Latest Longitude' });
let  prom_lastlat= new client.Gauge({ name: 'latest_latitude', help: 'Latest Latitude' });


router.all('/', async function (req, res, next) {
    if(passwd.password!= req.query.password) {
        res.write("User "+req.user+" unauthorized.");
        res.end();
        return;
    }
    global.hr= req.query.hr;
    global.lon= req.query.lon;
    global.lat= req.query.lat;
    global.user= req.query.user;

    
    
    prom_lasthr.set(parseFloat(global.hr));
    prom_lastlon.set(parseFloat(global.lon));
    prom_lastlat.set(parseFloat(global.lat));

    //console.log(req.query)
    let obj= new Object();
    obj.hr= global.hr;
    obj.lon= global.lon;
    obj.lat= global.lat;
    obj.user= req.query.user;

    let eo = new Object();
    eo.hr= global.hr;
    eo.lon= global.lon;
    eo.lat= global.lat;
    eo.user= req.query.user;

    io.emit("garmin", eo);

    obj.heartrate = parseInt(obj.hr);
    obj.deviceid = obj.user;
    obj.location = obj.lon + "," + obj.lat;
    if(obj.location.includes("---")) {
      obj.location="-122.957359,50.116322";
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
    obj.color="0x80FFFFFF";
    obj.deviceid="245";

    if(obj.user.length>8)
      obj.user= obj.user.substring(0, 7)
    
    delete obj.lon;
    delete obj.lat;
    delete obj.hr;
  
    // Post to duplicator
    //fields':[{'name':'heartrate','pivot':true,'type':'Integer'},{'name':'user','pivot':false,'type':'String'},{'name':'deviceid','pivot':false,'type':'String'},{'name':'color','pivot':false,'type':'String'},{'name':'id','type':'Long','pivot':'false'},{'name':'location','type':'Location','pivot':'false'},{'name':'event_timestamp','type':'Date/time','pivot':'false'}]
    try {
      result = await axios.post(process.env.MESSAGE_DUPLICATOR, JSON.stringify(obj));
    }
    catch (err) {
      global.logger.log("Error", "Can't post data to Dupplicator " + process.env.MESSAGE_DUPLICATOR + " " + JSON.stringify(obj)+ " "+err);
    }
  
    res.write("OK.\n");
    res.end();
  //res.render('home', { title: 'The Gym', hr:hr, lon:lon, lat:lat });
});
 

module.exports = router;
