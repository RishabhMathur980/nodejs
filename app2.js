const path = require('path');
const fs = require('fs');
const express = require('express');
const { Console } = require('console');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const helmet = require('helmet');
const hpp = require('hpp');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./controllers/errorHandler.js');
const app = express();

//serving static files
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public2')));
const viewRoutes = require('./routes/viewRoutes');
const tourRouters = require(`./routes/tourRouters.js`);
const userRouters = require(`./routes/userRouters.js`);
const bookingRouters = require('./routes/bookingRoute');
const reviewRouter = require('./routes/reviewRoute');
const AppError = require('./utils/appError');
const { env } = require('process');
const { errorMonitor } = require('stream');
// GLOBAL MIDDLEWARE

//set security http headers
//app.use(helmet());

//development logging
if (process.env.NODE_ENV == 'development') {
  app.use(morgan('dev'));
}

//limit requests from API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'to many request from this API..plzz try again after an hour!!! ',
});
app.use('/api', limiter);

//body parser,reading data from body,req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  // console.log('hello from the middleware');
  next();
});
app.use(compression());
//data sanitization using noSQL query injection
app.use(mongoSanitize());

//data sanitization against xss
app.use(xss());

//preventing parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
app.use(cookieParser());
//TEST MIDDLEWARE
app.use((req, res, next) => {
  reqTime = new Date().toISOString();
  // console.log(req.cookies);

  next();
});
//start server
//ROUTE
app.use('/api/v1/booking', bookingRouters);
app.use('/', viewRoutes);
app.use('/api/v1/tour', tourRouters);
app.use('/api/v1/user', userRouters);
app.use('/api/v1/review', reviewRouter);
// app.all('*', (req, res, next) => {
//   res.status(404).send({
//     status: 'failed',
//     message: `the ${req.originalUrl} is not a valid url`,
//   });
// });
app.all('*', (req, res, next) => {
  // const err = new Error(`the ${req.originalUrl} is not a valid url`);
  // err.statusCode = 404;
  // err.status = 'fail';
  next(new AppError(`the ${req.originalUrl} is not a valid url`, 404));
});
app.use(errorHandler);

module.exports = app;
