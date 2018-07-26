require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var bodyParser = require("body-parser");
var logger = require('morgan');
var session = require('express-session');

var indexRouter = require('./routes/index');
var accountsRouter = require('./routes/accounts');
var rewardsRouter = require('./routes/rewards');
var communitiesRouter = require('./routes/communities');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
  secret:process.env.SESSION_SECRET,
  resave: false,
  httpOnly: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV == "production" }
}));

app.use('/api', indexRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/rewards', rewardsRouter);
app.use('/api/communities', communitiesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

if (process.env.NODE_ENV == "production") {
  app.use(express.static(`${__dirname}/../web/ui-react/build`));
}

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV == "production" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
