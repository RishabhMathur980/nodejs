const express = require('express');
const AppError = require('../utils/appError');
const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchError');
const factoryHandler = require('./../controllers/factoryHandler');
exports.createIdUser = (req, res, next) => {
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  if (!req.body.user) {
    req.body.user = req.user.id;
  }
  next();
};

// exports.postReview = catchAsync(async (req, res, next) => {
//   const review = await Review.create(req.body);
//   if (!review) {
//     return next(new AppError('the review is not provided'), 404);
//   }
//   res.status(200).json({
//     status: 'success',
//     reviews: review,
//   });
// });
// exports.getReview = catchAsync(async (req, res, next) => {
//   let tours = {};
//   if (req.params.tourId) {
//     tours = { tour: req.params.tourId };
//   }
//   // const filter = { tour: req.params.tourId };
//   const review = await Review.find(tours);
//   if (!review) {
//     return next(new AppError('review is not there', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     reviews: review,
//   });
// });
exports.getReview = factoryHandler.getAllTour(Review);
exports.getReviewId = factoryHandler.getById(Review);
exports.updateReview = factoryHandler.updateOne(Review);
exports.deleteReview = factoryHandler.deleteOne(Review);
exports.postReview = factoryHandler.createOne(Review);
