const { Router } = require('express');
const express = require('express');
const tourHandlers = require(`./../controllers/tourHandlers.js`);
const authorization = require('./../controllers/authentication');
const reviewRoutes = require('./../routes/reviewRoute');
const app = require('../app2.js');
const Routers = express.Router();
// Routers.param('id', tourHandlers.checkId);
Routers.use('/:tourId/reviews', reviewRoutes);
Routers.route('/tour-within/:distance/centre/:latlng/units/:units').get(
  tourHandlers.getTourWithin
);
Routers.route('/distances/:latlng/units/:units').get(tourHandlers.getDistance);
Routers.route('/get-stats').get(tourHandlers.getStats);
Routers.route('/cheap-tour').get(tourHandlers.alias, tourHandlers.getTour);
Routers.route('/get-plan/:year').get(
  authorization.protect,
  authorization.restrict('admin', 'lead-guide'),
  tourHandlers.getMonthlyPlan
);
Routers.route('/')
  .get(authorization.protect, tourHandlers.getTour)
  .post(
    authorization.protect,
    authorization.restrict('admin', 'lead-guide'),
    tourHandlers.postTour
  );
Routers.route('/:id')
  .get(tourHandlers.getTourById)
  .patch(
    authorization.protect,
    authorization.restrict('admin', 'lead-guide'),
    tourHandlers.uploadPhoto,
    tourHandlers.resizePhoto,
    tourHandlers.updateTour
  )
  .delete(
    authorization.protect,
    authorization.restrict('admin', 'lead-guide'),
    tourHandlers.deleteTour
  );
// Routers.route('/:tourId/reviews').post(
//   authorization.protect,
//   authorization.restrict('user'),
//   reviewHandler.postReview
// );
module.exports = Routers;
