const mongoose = require('mongoose');
const dontenv = require('dotenv');
dontenv.config({ path: './config.env' });
const { Mongoose } = require('mongoose');
process.on('uncaughtException', (err) => {
  console.log(err);
  // console.log('shuting down');
  server.close(() => {
    process.exit(1);
  });
});
const app = require('./app2.js');
const { prototype } = require('./utils/appError.js');
// console.log(process.env);
// console.log(app.get('env'));
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  // .connect(process.env.DATABASE_LOCAL, {
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    // console.log(con.connections);
    console.log('DB connected successfully');
  });
const RUN = process.env.PORT;
const server = app.listen(RUN, () => {
  console.log(`server is running at ${RUN} port`);
});
// console.log(process.env.NODE_ENV);
process.on('unhandledRejection', (err) => {
  console.log(err.message, err.name);
  console.log('shuting down');
  server.close(() => {
    process.exit(1);
  });
});
