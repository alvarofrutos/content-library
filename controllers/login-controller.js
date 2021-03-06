const User = require('../models/user');

const async = require('async');

const { body, validationResult } = require('express-validator');

// Display login form on GET.
exports.loginGet = function (req, res, next) {
  res.render('login-form', { title: 'Login' });
};

// Handle login on POST.
exports.loginPost = [
  // Validate and sanitise fields
  body('email')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Email must not be empty.')
    .isEmail()
    .withMessage('The email is not a valid email address.')
    .escape(),
  body('password')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Password must not be empty.'),

  // Process request after validation and sanitisation.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitised values/error messages.
      res.render('login-form', {
        title: 'Login',
        attempt: req.body,
        errors: errors.array(),
      });
    } else {
      User.authenticate(
        req.body.email,
        req.body.password,
        function (error, user) {
          if (error || !user) {
            res.render('login-form', {
              title: 'Login',
              attempt: req.body,
              errors: [{ msg: 'Wrong email or password.' }],
            });
          } else {
            req.session.userId = user._id;
            return res.redirect('/');
          }
        }
      );
    }
  },
];

// Display register form on GET.
exports.registerGet = function (req, res, next) {
  res.render('register-form', { title: 'Register' });
};

// Handle register on POST.
exports.registerPost = [
  // Validate and sanitise fields
  body('firstName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name must not be empty.')
    .escape(),
  body('familyName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Last name must not be empty.')
    .escape(),
  body('email')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Email must not be empty.')
    .isEmail()
    .withMessage('The email is not a valid email address.')
    .escape(),
  body('password')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Password must not be empty.'),
  body('passwordConf')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Password must not be empty.')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Paswords do not match.'),

  // Process request after validation and sanitisation.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitised values/error messages.
      res.render('register-form', {
        title: 'Register',
        attempt: req.body,
        errors: errors.array(),
      });
    } else {
      // Create a User object with escaped and trimmed data.
      var user = new User({
        firstName: req.body.firstName,
        familyName: req.body.familyName,
        email: req.body.email,
        password: req.body.password,
      });
      user.save(function (err) {
        if (err) {
          return next(err);
        }
        res.redirect('/login');
      });
    }
  },
];

// Handle logout on GET.
exports.logoutGet = function (req, res, next) {
  if (req.session) {
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    });
  }
};

// Middleware for setting the user data
exports.setUserData = function (req, res, next) {
  if (req.session && req.session.userId) {
    User.findOne({ _id: req.session.userId }).exec(function (err, user) {
      if (err) {
        return next(err);
      } else {
        res.locals.activeUser = user;
        return next();
      }
    });
  } else {
    return next();
  }
};

// Middleware for checking the session
exports.requiresLogin = function (req, res, next) {
  if (res.locals.activeUser) {
    return next();
  } else {
    res.redirect('/login');
  }
};
