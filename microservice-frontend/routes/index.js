let express = require('express');
let router = express.Router();

const client = require('prom-client');
const counter = new client.Counter({
  name: 'metric_name',
  help: 'metric_help',
});

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'The Gym' });
});

/* GET Home */
router.get('/app/home', function (req, res, next) {
  res.render('home', { title: 'The Gym', user:global.user, hr:global.hr, lon:global.lon, lat:global.lat });
});

var passwd= require('../passwd.json');

router.get('hr'), function (req, res, next) {
  if(passwd.password!= req.query.password) {
      res.write("User "+req.user+" unauthorized.");
      res.end();
      return;
  }
  let obj= new Object();
    obj.hr= global.hr;
    obj.lon= global.lon;
    obj.lat= global.lat;
    obj.user= global.user;
  res.write(JSON.stringify(obj))
}
module.exports = router;
