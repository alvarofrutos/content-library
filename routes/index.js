const express = require('express');
const router = express.Router();

const loginController = require('../controllers/login-controller');

/// MAIN ROUTES ///

/* GET home page. */
router.get('/', loginController.requiresLogin, function(req, res, next) {
   res.render('index', { title: 'Content library' });
});

/// SESSION ROUTES ///

// GET request for login. 
router.get('/login', loginController.loginGet);

// POST request for registering. 
router.post('/login', loginController.loginPost);

// GET request for registering. 
router.get('/register', loginController.registerGet);

// POST request for registering. 
router.post('/register', loginController.registerPost);

// GET request for logout. 
router.get('/logout', loginController.logoutGet);

module.exports = router;
