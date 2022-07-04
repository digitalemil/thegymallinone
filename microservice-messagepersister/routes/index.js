var express = require('express');
var router = express.Router();
var app = express();
var url= require('url');
var request = require('request');
var http = require("http");
var laststatus= "";
var lastmsg= "";
var async = require('async');
var fs = require('fs');
var pg = require('pg');

// Connect to the "thegym" database.
var config = {
  host: process.env.DBHOST,
  database: 'thegym',
  port: process.env.DBPORT,
  user: "thegym",
  sslmode: "disable"
};

// Create a pool.
var pool = new pg.Pool(config);
let client;

pool.connect(function (err, c, done) {
  if (err) {
    global.logger.log("error", "Connection failed: "+JSON.stringify(config));
  }
  else {
    client= c;
    global.logger.log("info", "Connected to: "+JSON.stringify(config));   
  }
});


let jsonappdef= new String(process.env.APPDEF);
jsonappdef= jsonappdef.replace(/\'/g, '\"');

let appdef= JSON.parse(jsonappdef);
let fields= new Array(); 
let types= new Array();

for(var i= 0; i< appdef.fields.length; i++) {
  fields[i] = appdef.fields[i].name;
  types[i] = appdef.fields[i].type;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: "Message Persister", status: laststatus, msg: lastmsg });
});


router.post('/persist', async function(req, res, next) {
 let msg= req.body;
 global.logger.log("info", "Persisting: "+msg);
 
 let jsonmsg= null;
 try {
   jsonmsg= JSON.parse(msg);
 }
 catch(ex) {
   global.logger.log("error", ex.toString());
   sendError(res, 0);
   return;
 }
 let start= new Date().getTime();
 let sql= "INSERT INTO HRDATA (id, color, location, event_timestamp, deviceid, username, heartrate) VALUES ("+jsonmsg.id+", '"+jsonmsg.color+"', '"+jsonmsg.location+"', '"+jsonmsg.event_timestamp+"', '"+jsonmsg.deviceid+"', '"+jsonmsg.user+"', "+jsonmsg.heartrate+")";
 await client.query(sql);
 let finish= new Date().getTime();
 global.logger.log("info", "Executed in "+(finish-start)+ "ms "+sql);
 res.statusCode= 200;
 res.end();
});

module.exports = router;

