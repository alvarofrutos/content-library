const User = require('../models/user');

const async = require('async');

const { body,validationResult } = require('express-validator');

// Display login form on GET.
exports.loginGet = function(req, res, next) {
  res.render('login-form', { title: 'Login' });
};

// Handle login on POST.
exports.loginPost = [

  // Validate and sanitise fields
  body('email').isLength({ min: 1 }).trim().withMessage('Email must not be empty.')
    .isEmail().withMessage('The email is not a valid email address.').trim().escape(),
  body('password').isLength({ min: 1 }).trim().withMessage('Password must not be empty.').trim(),

  // Process request after validation and sanitisation.
  (req, res, next) => {
      
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    
    // Check if pass

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitised values/error messages.
      res.render('login-form', { title: 'Login', attempt: req.body, errors: errors.array() });
    }
    else {
      
      User.authenticate(req.body.email, req.body.password, function (error, user) {
        if (error || !user) {
          res.render('login-form', { title: 'Login', attempt: req.body, errors: [{ msg:'Wrong email or password.'}] });
        } else {
          req.session.userId = user._id;
          return res.redirect('/');
        }
      });
    }
  }
];


// Display register form on GET.
exports.registerGet = function(req, res, next) {
  res.render('register-form', { title: 'Register' });
};


// Handle register on POST.
exports.registerPost = [

  // Validate and sanitise fields
  body('email').isLength({ min: 1 }).trim().withMessage('Email must not be empty.')
    .isEmail().withMessage('The email is not a valid email address.').trim().escape(),
  body('password').isLength({ min: 1 }).trim().withMessage('Password must not be empty.').trim(),
  body('passwordConf').isLength({ min: 1 }).trim().withMessage('Password must not be empty.')
    .custom((value, { req }) => value === req.body.password).withMessage('Paswords do not match.').trim(),

  // Process request after validation and sanitisation.
  (req, res, next) => {
      
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    
    // Check if pass

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitised values/error messages.
      res.render('register-form', { title: 'Register', attempt: req.body, errors: errors.array() });
    }
    else {
      
      User.findOne({ email: req.body.email })
        .exec(function (err, user) {
          if (err) { return next(err); }
          
          if (!user) {
            res.render('register-form', { title: 'Register', attempt: req.body, errors: [{ msg:'User does not exist.'}] });
          } else if (user.password) {
            res.render('register-form', { title: 'Register', attempt: req.body, errors: [{ msg:'User already registered.'}] });
          } else {
            
            // Set the new password
            user.password = req.body.password
      
            // Data from form is valid
            user.save(function (err) {
              if (err) { return next(err); }
              res.redirect('/login');
            });
          }
        });
    }
  }
];


// Handle logout on GET.
exports.logoutGet = function(req, res, next) {
  if (req.session) {
    req.session.destroy(function (err) {
      if (err) { return next(err); }
      res.redirect('/login');
    });
  }
};

// Middleware for checking the session
exports.requiresLogin = function(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    res.redirect('/login');
  }
}

