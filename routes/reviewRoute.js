const express = require('express');
const Routers = express.Router({ mergeParams: true });
const reviewHandler = require('./../controllers/reviewHandler');
const authHandlers = require('./../controllers/authentication');
Routers.use(authHandlers.protect);
Routers.route('/')
  .get(reviewHandler.getReview)
  .post(
    authHandlers.restrict('user'),
    reviewHandler.createIdUser,
    reviewHandler.postReview
  );
Routers.route('/:id')
  .get(reviewHandler.getReviewId)
  .delete(authHandlers.restrict('user', 'admin'), reviewHandler.deleteReview)
  .patch(authHandlers.restrict('user', 'admin'), reviewHandler.updateReview);

module.exports = Routers;
