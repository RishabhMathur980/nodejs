const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./../models/userModel');
const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'the name should be mendatory'],
      unique: true,
      minlength: [10, 'the name is less that 40 ch'],
      maxlength: [40, 'the name is more that 10 ch'],
      // validate: [validator.isAlpha, 'a validator must contain alphabets'],
    },
    duration: {
      type: Number,
      required: [true, 'the duration is required'],
    },
    slug: {
      type: String,
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'the maxGroupSize is required'],
    },
    difficulty: {
      type: String,
      required: [true, 'the difficulty is required'],
      enum: {
        values: ['easy', 'difficult', 'medium'],
        message: 'the level is not validate',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.6,
      max: [5, 'the rating is less than 5'],
      min: [1, 'the rating is more than 1'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'the price should be mendatory'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'the price discount is lesser than price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'the summary should be mendatory'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'the imagecover should be mendatory'],
    },
    images: [String],
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    //child referencing
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    // reviews: [
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Review',
    //   },
    // ],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    startDates: [Date],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
tourSchema.virtual('durationWeek').get(function () {
  return this.duration / 7;
});
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
//only access for create(),save()...not fot insertmany(),updatebyid(),find()

//1) DOCUMENT MALWARE
// tourSchema.pre('save', function (next) {
//   console.log(this);
//   next();
// });
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
// tourSchema.post('save', function (doc, next) {
//   console.log(this);
//   next();
// });

//2)QUERY MALWARE

//child referencing of review to get all review in tour
// tourSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'reviews',
//     select: 'review ',
//   });
//   next();
// });

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});
//for embedding the users who are guide
// tourSchema.pre('save', async function (next) {
//   const guides = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guides);
//   console.log('hbrgf');
//   next();
// });

//index
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

//3) AGGREGATE MALWARE

// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;

//   const testTour = new Tour({
//     name: 'rishabh mathur',
//     price: 345,
//     // rating: 4.7,
//   });
//   const testTour2 = new Tour({
//     name: 'the sea explorer',
//     price: 345,
//     rating: 4.7,
//   });
//   testTour
//     .save()
//     .then((doc) => {
//       console.log(doc);
//     })
//     .catch((err) => {
//       console.log('ERROR', err);
//     });
//   testTour2
//     .save()
//     .then((doc) => {
//       console.log(doc);
//     })
//     .catch((err) => {
//       console.log('ERROR', err);
//     });
