const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const app = express();

app.use(cors({origin: 'https://papaya-bombolone-370bd1.netlify.app', credentials: true}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', require('./routes/index.js'));

// catch 404 and forward to error handler
// app.use(function(err, req, res, next) {
//   console.log(err);
//   next(createError(404));
// });

// error handler
app.use(function(error, req, res, next) {
  res.status(error.status || 500);
  return res.json({error});
});

module.exports = app;
