var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var ParseServer = require('parse-server').ParseServer;

var api = new ParseServer({ 
    databaseURI: 'mongodb://localhost:27017/dev',
    appId: 'appId',
    masterKey: 'masterKey', // Keep this key secret!
    javascriptKey: 'javascriptKey',
    serverURL: 'http://localhost:3000/parse' // Don't forget to change to https if needed 
  });

var app = express();

app.use('/parse', api);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var Parse = require('parse/node').Parse;
Parse.initialize('appId', 'javascriptKey', 'masterKey');
Parse.serverURL = 'http://localhost:3002/parse'
Parse.Cloud.useMasterKey();

global.Parse = Parse;

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/scripts', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js/')));
app.use('/scripts', express.static(path.join(__dirname, 'node_modules/jquery/dist/')));
app.use('/scripts', express.static(path.join(__dirname, 'node_modules/angular/')));
app.use('/stylesheets', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css/')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
