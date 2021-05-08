const express = require('express');
const userHandlers = require(`./../controllers/userHandlers.js`);
const authHandlers = require('./../controllers/authentication');

const { Router } = require('express');
const Routers = express.Router();

Routers.post('/signup', authHandlers.signUp);
Routers.post('/login', authHandlers.login);
Routers.get('/logout', authHandlers.logout);
Routers.post('/forgetpassword', authHandlers.forgetPassword);
Routers.post('/resetpassword', authHandlers.resetPassword);
//middleware to protect all the below api
Routers.use(authHandlers.protect);
Routers.get('/me', userHandlers.getMeId, userHandlers.getMe);
Routers.patch(
  '/updateme',
  userHandlers.uploadPhoto,
  userHandlers.resizePhoto,
  userHandlers.updateData
);
Routers.patch('/deleteme', userHandlers.deleteMe);
Routers.patch('/updatepassword', authHandlers.updatePassword);
//middleware to restrict to admin only
Routers.use(authHandlers.restrict('admin'));
Routers.route('/').get(userHandlers.getUser).post(userHandlers.postUser);
Routers.route('/:id')
  .get(userHandlers.getUserById)
  .patch(userHandlers.updateUser)
  .delete(userHandlers.deleteUser);
module.exports = Routers;
