const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
dotenv.config({ path: './config.env' });
const app = require('./app2.js');
const Tour = require('./models/tourModels');
const User = require('./models/userModel');
const Review = require('./models/reviewModel');
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});
const data2 = JSON.parse(
  fs.readFileSync('./after-section-06/dev-data/data/tours.json', 'utf-8')
);
console.log(process.argv[1]);
const createTour = async (req, res) => {
  try {
    await Tour.create(data2, { validateBeforeSave: false });
    console.log('data  successfully loaded');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};
const deleteTour = async (req, res) => {
  try {
    await Tour.deleteMany();

    console.log('data deleted');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};
if (process.argv[2] == '--import') {
  createTour();
} else {
  deleteTour();
}
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`app is running at ${port} port`);
});
