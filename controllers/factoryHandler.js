const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchError');
const APIFeatures = require('./../utils/apiFeatures.js');
const { doc } = require('prettier');
exports.getAllTour = (model) =>
  catchAsync(async (req, res, next) => {
    let tours = {};
    if (req.params.tourId) {
      tours = { tour: req.params.tourId };
    }
    const features = new APIFeatures(model.find(tours), req.query)
      .filtering()
      .sorting()
      .limitingField()
      .pagination();
    // const doc = await features.query.explain();
    const doc = await features.query;
    res.status(200).json({
      status: 'success',
      size: doc.length,
      data: {
        tours: doc,
      },
    });
  });
exports.deleteOne = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('no document find in that id', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
exports.getById = (model, populateOpt) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findById(req.params.id).populate(populateOpt);
    // const tour = await Tour.findOne({ _id: req.params.id });
    if (!doc) {
      return next(new AppError('no document find in that id', 404));
    }
    res.status(200).json({
      status: 'success',
      size: doc.length,
      data: {
        tours: doc,
      },
    });
  });
exports.updateOne = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('no document find in that id', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        tours: doc,
      },
    });
  });
exports.createOne = (model) =>
  catchAsync(async (req, res, next) => {
    // const newTour=new Tour({})
    // newTour.save()

    const doc = await model.create(req.body);
    res.status(200).json({
      status: 'sucess',
      data: {
        tour: doc,
      },
    });
  });
