//require('appmetrics-prometheus').attach()

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var winston = require('winston'),
    expressWinston = require('express-winston');



var app = express();
var initJaegerTracer = require("jaeger-client").initTracer;

function initTracer(serviceName) {
  var config = {
    serviceName: serviceName,
    sampler: {
      type: "const",
      param: 1,
    },
    reporter: {
      logSpans: true,
    },
  };
  var options = {
    logger: {
      info: function logInfo(msg) {
        console.log("INFO ", msg);
      },
      error: function logError(msg) {
        console.log("ERROR", msg);
      },
    },
  };
  return initJaegerTracer(config, options);
}
initTracer("messagetransformer");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Prometheus Client integration 
const prom_client = require('prom-client');
const register = prom_client.register;
prom_client.collectDefaultMetrics({ register });
app.get('/metrics', async (_req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());  
  } catch (err) {
    res.status(500).end(err);
  }
});
const wlogger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  defaultMeta: {  },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    
    new winston.transports.Stream({
      stream: process.stderr,
      level: 'info',
    }),
    new winston.transports.File({ filename: process.env.LOGFOLDER+'/microservice-messagetransformer/error.log', level: 'error' }),
    new winston.transports.File({ filename: process.env.LOGFOLDER+'/microservice-messagetransformer/combined.log' }),
  ],
});
const loggermw = expressWinston.logger({
  winstonInstance: wlogger,
  meta: true, // optional: control whether you want to log the meta data about the request (default to true)
  msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
  expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
  colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
  ignoreRoute: function (req, res) { return false; } // optional: allows to skip some log messages based on request and/or response
})
global.logger= wlogger;


wlogger.log("info", "Starting microservice-messagetransformer")
app.use(loggermw);
var index = require('./routes/index');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.text({type: '*/*'}));
app.use(bodyParser.raw());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
