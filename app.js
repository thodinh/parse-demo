/*global CLIENT_ID, CLIENT_SECRET, REDIRECT_URL*/
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var google = require('googleapis');
var session = require('express-session');
global.CLIENT_ID = '685613683543-ehr3gubfi6ejqkiuior25eb684g52v79.apps.googleusercontent.com';
global.CLIENT_SECRET = '-ePe7SXB9IaYQ2XJjEYuUMta';
global.REDIRECT_URL = 'https://bookshelf-online-thodinh1.c9users.io/users/oauth';
var oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
// generate a url that asks permissions for Google+ and Google Calendar scopes
var scopes = [
  'openid', 'email'
];

var loginUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token),
  scope: scopes
});

var routes = require('./routes/index');
var users = require('./routes/users');

var ParseServer = require('parse-server').ParseServer;
var api = new ParseServer({ 
    databaseURI: 'mongodb://127.0.0.1:27017/dev',
    appId: 'appId',
    masterKey: 'masterKey', // Keep this key secret!
    javascriptKey: 'javascriptKey',
    serverURL: 'https://localhost:3000/parse' // Don't forget to change to https if needed 
  });
var app = express();

app.use('/parse', api);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var Parse = require('parse/node').Parse;
Parse.initialize('appId', 'javascriptKey', 'masterKey');
Parse.serverURL = 'https://bookshelf-online-thodinh1.c9users.io/parse';

global.Parse = Parse;

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));

app.use(session({secret: '1234567890QWERTY'}));

app.use(function(req, res, next) {
    // console.log(req.session);
    res.locals.loginUrl = loginUrl;
    next();
});

app.use(function(req, res, next) {
  res.locals.user = req.session.user;
  next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/jquery', express.static(path.join(__dirname, 'node_modules/jquery/dist/')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/')));
app.use('/angularjs', express.static(path.join(__dirname, 'node_modules/angular/')));
app.use('/images', express.static(path.join(__dirname, 'uploads/')));

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
console.log('ready');

module.exports = app;