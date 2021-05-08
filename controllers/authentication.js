const { promisify } = require('util');
const fs = require('fs');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('./../utils/catchError');
const Apperror = require('./../utils/appError');
const Email = require('./../utils/email');
const crypto = require('crypto');
const { hash } = require('bcrypt');
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES * 24 * 60 * 60 * 1000,
  });
};
const createSendToken = (user, statuscode, res) => {
  const token = signToken(user._id);
  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  res.cookie('jwt', token, cookieOption);
  if (process.env.NODE_ENV == 'production') {
    cookieOption.secure = true;
  }
  res.status(statuscode).json({
    status: 'success',
    tokens: token,
    users: user,
  });
};
exports.signUp = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);
  const url = `${req.protocol}://${req.get('host')}/me`;
  // console.log(url);
  new Email(user, url).sendWelcome();
  createSendToken(user, 200, res);
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // const user = {
  //   email: req.body.email,
  //   password: req.body.password,
  // };
  const userDB = await User.findOne({ email }).select('+password');
  if (!email || !password) {
    return next(new Apperror('plzz enter the email or password', 401));
  }

  if (!userDB || !(await userDB.correctPassword(password, userDB.password))) {
    return next(new Apperror('plzz enter the correct email or password', 401));
  }

  createSendToken(userDB, 200, res);
});
exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'logout success', {
    // expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
});
exports.protect = catchAsync(async (req, res, next) => {
  //1) getting the token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new Apperror('you are not logged in!!plzz logged in to get access', 401)
    );
  }
  //2) verify
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //3) user exist or not
  const currentUser = await User.findById(decode.id);
  if (!currentUser) {
    return next(
      new Apperror('the user belonging to this no longer exist', 401)
    );
  }
  //4) if the password is changed
  if (currentUser.changePasswordAt(decode.iat)) {
    return next(new Apperror('the password is changed....login again', 401));
  }
  req.user = currentUser;
  res.locals.users = currentUser;

  next();
});

exports.getLogedIn = async (req, res, next) => {
  //1) getting the token
  try {
    if (req.cookies.jwt) {
      //2) verify
      const decode = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      //3) user exist or not
      const currentUser = await User.findById(decode.id);
      // console.log(currentUser);

      if (!currentUser) {
        return next();
      }
      //4) if the password is changed
      if (currentUser.changePasswordAt(decode.iat)) {
        return next();
      }
      res.locals.users = currentUser;
      // console.log(res.locals.user);
      return next();
    } else {
      return next();
    }
  } catch (err) {
    return next();
  }
};

exports.restrict = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new Apperror(`this route is restrict to ${roles} only`), 401);
    }
    // console.log(req.user.role);
    next();
  };
};
exports.forgetPassword = catchAsync(async (req, res, next) => {
  //1) get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new Apperror('there is no user with this email', 404));
  }
  //2) generate the random token
  const resetToken = user.createResetToken();
  fs.writeFile(`${__dirname}/file.txt`, resetToken, 'utf-8', (err) => {
    if (err) {
      console.log('unable to edit the file');
    }
  });
  await user.save({ validateBeforeSave: false });
  //  3)send it to user email
  //const message = `${resetUrl}.......plzz g=reset the password`;
  try {
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/resetpassword/${resetToken}`;
    await new Email(user, resetUrl).passwordReset();
    res.status(200).json({
      status: 'success',
      message: resetToken,
    });
  } catch (err) {
    (user.passwordResetToken = undefined),
      (user.passwordTokenExpires = undefined);
    await user.save({ validateBeforeSave: false });
    return next(new Apperror('there was an error sending to the mail', 500));
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const resettoken = fs.readFileSync(`${__dirname}/file.txt`, 'utf-8');
  const hashedToken = crypto
    .createHash('sha256')
    .update(resettoken)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordTokenExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new Apperror('token is invalid or expires', 500));
  }
  (user.password = req.body.password),
    (user.confirmPassword = req.body.confirmPassword),
    (user.passwordResetToken = undefined),
    (user.passwordTokenExpires = undefined);
  await user.save();
  createSendToken(user, '200', res);
  next();
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) get user
  //not use findByIdandUpdate
  const user = await User.findById(req.user.id).select('+password');

  //2)check if the posted password matches ur password
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(
      new Apperror('the current password and the password not match'),
      401
    );
  }
  //3)update the password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  //4)sending token
  createSendToken(user, 200, res);
});
