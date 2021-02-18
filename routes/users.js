const express = require('express');
const router = express.Router();

// Require controller modules.
const userController = require('../controllers/user-controller');

/// MAIN ROUTES ///

// GET home page.
router.get('/', function (req, res, next) {
  // Redirect to user list. This can be changed if webpage is extended in the future
  res.redirect('/users/list');
});

/// USER ROUTES ///

// GET request for creating a User.
router.get('/user/create', userController.userCreateGet);

// POST request for creating User.
router.post('/user/create', userController.userCreatePost);

// GET request to delete User.
router.get('/user/:id/delete', userController.userDeleteGet);

// POST request to delete User.
router.post('/user/:id/delete', userController.userDeletePost);

// GET request to update User.
router.get('/user/:id/update', userController.userUpdateGet);

// POST request to update User.
router.post('/user/:id/update', userController.userUpdatePost);

// GET request for one User.
router.get('/user/:id', userController.userDetail);

// GET request for list of all Users.
router.get('/list', userController.userList);

module.exports = router;
