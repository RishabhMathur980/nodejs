//review//rating//createdat//tour//user
const mongoose = require('mongoose');
const Tour = require('./tourModels');
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'review cannot be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      mac: 5,
      required: [true, 'ratings cannot be empty'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    //parent referencing
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      require: [true, 'tour must be there'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      require: [true, 'user must be there'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
reviewSchema.statics.calcAverageRating = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        nAverage: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);
  await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stats[0].nAverage,
    ratingsQuantity: stats[0].nRating,
  });
};
reviewSchema.index(
  { tour: 1, user: 1 },
  {
    unique: true,
  }
);
reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.tour);
});

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
