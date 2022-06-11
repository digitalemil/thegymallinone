let express = require('express');
let router = express.Router();
let app = express();
let url = require('url');
let request = require('request');
let http = require("http");
let yamlParser = require('yamljs');
let Fiber = require('fibers');
let parseString = require('xml2js').parseString;
let xmlasjson;
let httpProxy = require('http-proxy');

let rawtext= "";
let result= ""
let laststatus;

function fiberparseXML(xml, ret) {
  let fiber = Fiber.current;
  parseString(xml, function (err, result) {
    xmlasjson = result;
  });
  Fiber.yield();
};


function parseXML(xml) {
  let ret = "";
  Fiber(function () {
    global.logger.log("info","Parse XML: " + xml)
    fiberparseXML(xml, ret);
  }).run();
  return xmlasjson;
};

let appjson = new String(process.env.APPDEF);
appjson = appjson.replace(/\'/g, '\"');

let appdef = JSON.parse(appjson);

let transformer = decodeURIComponent(appdef.transformer);
global.logger.log("info","Transformer: " + transformer);

let fields = new Array();
let types = new Array()
let typesByName = new Object();

for (let i = 0; i < appdef.fields.length; i++) {
  fields[i] = appdef.fields[i].name;
  types[i] = appdef.fields[i].type;
  typesByName[fields[i]] = types[i];
}

router.post('/', function (req, res, next) { 
  rawtext= req.body
  result= rawtext;
   
  try {
    eval(transformer.toString());
    if (result == null)
      throw "result== null";
    res.write(result);
    res.statusCode = 200;
  }
  catch (ex) {
    res.statusCode = 400;
    result = ex.toString();
  }
  laststatus = res.statusCode;
  res.end();
});

/* GET home page. */
router.get('/', function (req, res, next) {
  let status;
  if (laststatus==undefined)
    status= "No msg received yet";
  else
    status= laststatus;
  res.render('index', { title: "Message Transformer", status: status, lastin: rawtext, lastout: result });
});

module.exports = router;


