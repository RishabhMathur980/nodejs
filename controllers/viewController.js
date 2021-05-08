const Tour = require('./../models/tourModels');
const catchAsync = require('./../utils/catchError');
const Apperror = require('./../utils/appError');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');
exports.getOverview = catchAsync(async (req, res) => {
  //1) get all tours data from collection
  const tours = await Tour.find();
  //2) build template-(in overview.pug)
  //3) render that template using 1
  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tour) {
    return next(new Apperror('this is not a tour', 404));
  }
  res.status(200).render('tour', {
    title: tour.slug,
    tour,
  });
});
exports.getLogin = catchAsync(async (req, res) => {
  // res.status(200).json({
  //   status: 'success',
  // });
  res.status(200).render('login', {
    title: 'Login',
  });
});
exports.getMe = catchAsync(async (req, res) => {
  res.status(200).render('settings', {
    title: 'Your Account',
  });
});
exports.forgetPassword = catchAsync(async (req, res) => {
  res.status(200).render('forgetPassword', {
    title: 'Forget Password',
  });
});
exports.resetPassword = catchAsync(async (req, res) => {
  // console.log(req.params.token);
  res.status(200).render('resetPassword', {
    title: 'Reset Password',
  });
});
// exports.updateData = catchAsync(async (req, res) => {
//   const updateUser = await User.findByIdAndUpdate(
//     req.user.id,
//     {
//       name: req.body.name,
//       email: req.body.email,
//     },
//     {
//       new: true,
//       runValidators: true,
//     }
//   );
//   res.status(200).render('settings', {
//     title: 'Your Account',
//     users: updateUser,
//   });
// });
exports.myReview = catchAsync(async (req, res) => {
  const review = await Review.find({ user: req.user.id });
  // console.log(review);
  res.status(200).render('myreview', {
    title: 'My Review',
    review,
  });
});
exports.signin = catchAsync(async (req, res) => {
  res.status(200).render('signup', {
    title: 'Create Your Account',
  });
});
