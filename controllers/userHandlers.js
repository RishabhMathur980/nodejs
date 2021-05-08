const User = require('./../models/userModel');
const sharp = require('sharp');
const multer = require('multer');
const catchAsync = require('./../utils/catchError');
const Apperror = require('./../utils/appError');
const factoryHandler = require('./../controllers/factoryHandler');
const Review = require('../models/reviewModel');
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public2/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });
const multerStorage = multer.memoryStorage();
const multerfilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Apperror('this is not an image', 400), false);
  }
};
exports.resizePhoto = (req, res, next) => {
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  if (!req.file) {
    return next();
  }
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public2/img/users/${req.file.filename}`);
  next();
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerfilter,
});
exports.uploadPhoto = upload.single('photo');
const filterobj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).map((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};
exports.updateData = catchAsync(async (req, res, next) => {
  // console.log(req.file);
  const filterBody = filterobj(req.body, 'email', 'name');
  if (req.file) {
    filterBody.photo = req.file.filename;
  }
  const user = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    users: user,
  });
});
exports.getMeId = (req, res, next) => {
  req.params.id = req.user.id;
  // console.log(req.user.id);
  next();
};
exports.getMe = factoryHandler.getById(User);
exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(200).json({
    status: 'success',
    data: null,
  });
});
// exports.getUser = async (req, res) => {
//   try {
//     const user = await User.find();
//     res.status(200).json({
//       status: 'success',
//       size: user.length,
//       data: {
//         users: user,
//       },
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'failed',
//       message: err,
//     });
//   }
// };
exports.getUser = factoryHandler.getAllTour(User);
exports.updateUser = factoryHandler.updateOne(User);
exports.getUserById = factoryHandler.getById(User);
// exports.getUserById = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     // const user = await User.findOne({ _id: req.params.id });
//     res.status(200).json({
//       status: 'success',
//       size: user.length,
//       data: {
//         users: user,
//       },
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'success',
//       message: err,
//     });
//   }
// };
// exports.postUser = factoryHandler.createOne(User);
exports.postUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(200).json({
      status: 'success',
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err,
    });
  }
};
// exports.updateUser = async (req, res) => {
//   try {
//     const user = await User.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });
//     res.status(200).json({
//       status: 'success',
//       data: {
//         users: user,
//       },
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'failed',
//       message: err,
//     });
//   }
// };
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(200).json({
      status: 'failed',
      data: err,
    });
  }
};
