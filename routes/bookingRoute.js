const express = require('express');
const bookingHandler = require('./../controllers/bookingHandler');
const expressMongoSanitize = require('express-mongo-sanitize');
const authentication = require('./../controllers/authentication');
const Routers = express.Router();
Routers.route('/createSession/:tourId').get(
  authentication.protect,
  bookingHandler.getcheckoutSession
);
module.exports = Routers;
