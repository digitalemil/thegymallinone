let express = require('express');
let router = express.Router();
global.hr= "---";
global.lon= "---";
global.lat= "---";
global.user= "---";
var passwd= require('../passwd.json');

const client = require('prom-client');

let  prom_lasthr = new client.Gauge({ name: 'latest_hr', help: 'Latest HR' });
let  prom_lastlon = new client.Gauge({ name: 'latest_longitude', help: 'Latest Longitude' });
let  prom_lastlat= new client.Gauge({ name: 'latest_latitude', help: 'Latest Latitude' });


router.all('/', function (req, res, next) {
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

    io.emit("session", obj);

    res.write("Thank you.\n");
    res.end();
  //res.render('home', { title: 'The Gym', hr:hr, lon:lon, lat:lat });
});
 

module.exports = router;
