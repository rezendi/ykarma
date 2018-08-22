require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var bodyParser = require("body-parser");
var logger = require('morgan');
var session = require('express-session');
var os = require('os');

var indexRouter = require('./routes/index');
var accountsRouter = require('./routes/accounts');
var rewardsRouter = require('./routes/rewards');
var communitiesRouter = require('./routes/communities');

var app = express();

var sessionConfig = {
    secret:process.env.SESSION_SECRET,
    resave: false,
    httpOnly: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" && os.hostname().indexOf('ykarma.com') >= 0 }
};
if (process.env.NODE_ENV === "production") {
  var RedisStore = require('connect-redis')(session);
  sessionConfig.store = new RedisStore({url:"redis://redis:6379"});
}
app.use(session(sessionConfig));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api', indexRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/rewards', rewardsRouter);
app.use('/api/communities', communitiesRouter);

console.log("hostname", os.hostname());
console.log("ykarma", process.env.YKARMA_ADDRESS);

if (process.env.NODE_ENV == "production") {
  app.enable('trust proxy');
  console.log("dirname is", path.normalize(path.join(__dirname, '/../web/build')));
  app.use(express.static(path.normalize(path.join(__dirname, '/../web/build'))));
}

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, '/../web/build', 'index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // TODO: set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV == "development" && false ? err : {};

  // render the error page
  console.log("error", err);
  res.status(err.status || 500);
  res.json({ error: err });
});

module.exports = app;
