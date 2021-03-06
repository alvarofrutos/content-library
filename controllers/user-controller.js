const User = require('../models/user');

const async = require('async');

const { body, validationResult } = require('express-validator');

// Display list of all Users.
exports.userList = function (req, res, next) {
  res.send('NOT IMPLEMENTED: User list: ' + req.params.id);
};

// Display detail page for a specific User.
exports.userDetail = function (req, res) {
  res.send('NOT IMPLEMENTED: User detail: ' + req.params.id);
};

// Display User create form on GET.
exports.userCreateGet = function (req, res, next) {
  res.render('user-form', { title: 'Create user' });
};

// Handle User create on POST.
exports.userCreatePost = [
  // Validate and sanitise fields
  body('firstName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name must not be empty.')
    .escape(),
  body('familyName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Family name must not be empty.')
    .escape(),
  body('email')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Email must not be empty.')
    .isEmail()
    .withMessage('The email is not a valid email address.')
    .escape(),

  // Process request after validation and sanitisation.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render('user-form', {
        title: 'Create user',
        user: user,
        errors: errors.array(),
      });
    } else {
      // Create a User object with escaped and trimmed data.
      var user = new User({
        firstName: req.body.firstName,
        familyName: req.body.familyName,
        email: req.body.email,
      });

      user.save(function (err) {
        if (err) {
          return next(err);
        }
        res.redirect(user.urlEdit);
      });
    }
  },
];

// Display User delete form on GET.
exports.userDeleteGet = function (req, res, next) {
  User.findById(req.params.id).exec(function (err, user) {
    if (err) {
      return next(err);
    }
    if (user == null) {
      res.redirect('/users/list');
    }
    // Successful, so render.
    res.render('user-delete', { title: 'Delete user', user: user });
  });
};

// Handle User delete on POST.
exports.userDeletePost = function (req, res, next) {
  User.findById(req.body.id).exec(function (err, user) {
    if (err) {
      return next(err);
    }
    // Delete the object and redirect
    User.findByIdAndRemove(req.body.id, function (err) {
      if (err) {
        return next(err);
      }
      res.redirect('/users/list');
    });
  });
};

// Display User update form on GET.
exports.userUpdateGet = function (req, res, next) {
  // Get the user to update
  User.findById(req.params.id).exec(function (err, user) {
    if (err) {
      return next(err);
    }
    if (user == null) {
      var err = new Error('User not found');
      err.status = 404;
      return next(err);
    }
    res.render('user-form', {
      title: 'Update user',
      user: user,
      update: true,
    });
  });
};

// Handle User update on POST.
exports.userUpdatePost = [
  // Validate and sanitise fields
  body('firstName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name must not be empty.')
    .escape(),
  body('familyName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Family name must not be empty.')
    .escape(),
  body('email')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Email must not be empty.')
    .isEmail()
    .withMessage('The email is not a valid email address.')
    .escape(),

  // Process request after validation and sanitisation.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitised values/error messages.
      res.render('user-form', {
        title: 'Update user',
        user: user,
        update: true,
        errors: errors.array(),
      });
    } else {
      // Get the user to update
      User.findById(req.params.id).exec(function (err, user) {
        if (err) {
          return next(err);
        }
        if (user == null) {
          var err = new Error('User not found');
          err.status = 404;
          return next(err);
        } else {
          user.firstName = req.body.firstName;
          user.familyName = req.body.familyName;
          user.email = req.body.email;
          if (res.locals.currentUser.admin) {
            user.admin = req.body.admin;
          }

          User.findByIdAndUpdate(req.params.id, user, {}, function (err, user) {
            if (err) {
              return next(err);
            }
            res.redirect(user.urlEdit);
          });
        }
      });
    }
  },
];
