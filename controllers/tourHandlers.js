const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const AppError = require('./../utils/appError');
const Tour = require('./../models/tourModels.js');
const APIFeatures = require('./../utils/apiFeatures.js');
const catchAsync = require('./../utils/catchError');
const factoryHandler = require('./../controllers/factoryHandler');
// const { promises } = require('node:stream');
const multerStorage = multer.memoryStorage();
const multerfilter = (req, file, cb) => {
  // console.log(file.mimetype);
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('not an image', 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerfilter,
});
exports.uploadPhoto = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);
exports.resizePhoto = async (req, res, next) => {
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public2/img/tours/${req.body.imageCover}`);

  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public2/img/tours/${filename}`);
      req.body.images.push(filename);
    })
  );
  next();
};
exports.alias = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage ,price';
  req.query.fields = 'name,price,summary,difficulty,ratingsAverage';
  next();
};
exports.getTour = factoryHandler.getAllTour(Tour);
// exports.getTour = catchAsync(async (req, res, next) => {
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filtering()
//     .sorting()
//     .limitingField()
//     .pagination();
//   const tour = await features.query;
//   res.status(200).json({
//     status: 'success',
//     size: tour.length,
//     data: {
//       tours: tour,
//     },
//   });
// });
// exports.getTourById = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.id).populate('reviews');
//   // const tour = await Tour.findOne({ _id: req.params.id });
//   if (!tour) {
//     return next(new AppError('no tour find in that id', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     size: tour.length,
//     data: {
//       tours: tour,
//     },
//   });
// });
// exports.postTour = catchAsync(async (req, res, next) => {
//   // const newTour=new Tour({})
//   // newTour.save()

//   const newTour = await Tour.create(req.body);
//   res.status(200).json({
//     status: 'sucess',
//     data: {
//       tour: newTour,
//     },
//   });
// });
exports.getTourById = factoryHandler.getById(Tour, { path: 'reviews' });
exports.postTour = factoryHandler.createOne(Tour);
exports.updateTour = factoryHandler.updateOne(Tour);
// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   if (!tour) {
//     return next(new AppError('no tour find in that id', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tours: tour,
//     },
//   });
// });
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(new AppError('no tour find in that id', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: null,
//   });
// });
exports.deleteTour = factoryHandler.deleteOne(Tour);
exports.getStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        // _id: null,
        // _id: {'$ratingsAverage'},
        _id: { $toUpper: '$difficulty' },
        numTour: { $sum: 1 },
        numRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: -1 },
    },
    {
      $match: { _id: { $ne: 4.7 } },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      tours: stats,
    },
  });
});
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const tour = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTour: { $sum: 1 },
        tour: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTour: -1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      tours: tour,
    },
  });
});
exports.getTourWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, units } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = units === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    return next(new AppError('plzz provide latitude and longitude', 400));
  }
  // console.log(distance, lat, lng, units);
  const tour = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: 'success',
    size: tour.length,
    tours: tour,
  });
});
exports.getDistance = catchAsync(async (req, res, next) => {
  const { latlng, units } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = units === 'mi' ? 0.00062137119 : 0.001;
  // const radius = units === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    return next(new AppError('plzz provide latitude and longitude', 400));
  }
  // console.log(lat, lng, units);
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    tours: distances,
  });
});
