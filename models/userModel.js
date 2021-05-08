const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'plzz tell your name'],
  },
  email: {
    type: String,
    required: true,
    validate: [validator.isEmail, 'plzz provide a valid email'],
    unique: true,
    lowercase: true,
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  password: {
    type: String,
    required: [true, 'plzz enter a password'],
    minlength: 8,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'plzz enter a confirm password'],
    minlength: 8,
    validate: {
      validator: function (el) {
        return el == this.password;
      },
      message: 'password does not match',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordTokenExpires: Date,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
  },
  active: {
    type: Boolean,
    default: true,
  },
});
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatepassword,
  userpassword
) {
  return await bcrypt.compare(candidatepassword, userpassword);
};
userSchema.methods.changePasswordAt = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changeTimestamp = this.passwordChangedAt.getTime() / 1000;
    return JWTTimeStamp < changeTimestamp;
  }
  return false;
};
userSchema.methods.createResetToken = function () {
  const reseTtoken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(reseTtoken)
    .digest('hex');
  // console.log({ reseTtoken }, this.passwordResetToken);
  this.passwordTokenExpires = Date.now() + 10 * 60 * 1000;
  return reseTtoken;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
