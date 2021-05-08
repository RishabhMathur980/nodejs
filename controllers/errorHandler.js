const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  message = `invalid ${err.path}:${err.value}`;
  return new AppError(message, 400);
};
const DuplicateFieldDB = (err) => {
  // const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const value = Object.values(err.keyValue).map((el) => el);
  message = `the duplicate name:${value}...plzz use another name`;
  return new AppError(message, 400);
};
const ValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `invalid input data...${errors.join(', ')}`;
  return new AppError(message, 400);
};
const handleTokenError = () => {
  return new AppError('invalid token...plzz login again!!', 401);
};
const sendErrorDev = (req, err, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      stack: err.stack,
      message: err.message,
    });
  }
  return res.status(err.statusCode).render('error', {
    title: 'something went wrong',
    msg: err.message,
  });
};
const sendErrorProd = (req, err, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      res.status(err.statusCode).json({
        status: 'error',
        message: 'something went wrong',
      });
    }
  }
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'something went wrong',
      msg: err.message,
    });
  } else {
    return res.status(err.statusCode).render('error', {
      title: 'plzz try again later',
      msg: err.message,
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(req, err, res);
  } else {
    // (process.env.NODE_ENV === 'production')
    let error = { ...err };
    error.message = err.message;
    let a = 1;
    // (error.name == 'CastError')
    if (error.kind == 'ObjectId') {
      error = handleCastErrorDB(error);
      a = 0;
    }
    if (error.code == '11000') {
      error = DuplicateFieldDB(error);
      a = 0;
    }
    if (a == 0) {
      const errors = Object.values(error.errors).map((el) => el.name)[0];
      if (errors == 'ValidatorError') {
        error = ValidationErrorDB(error);
      }
    }
    if (error.name == 'JsonWebTokenError') {
      error = handleTokenError();
    }
    sendErrorProd(req, error, res);
  }
};
