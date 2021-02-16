const User = require('../models/user');

const async = require('async');

const { body,validationResult } = require('express-validator');

// Display list of all Users.
exports.userList = function(req, res, next) {
  
  User.find().sort([
      ['family_name', 'ascending'],
      ['first_name', 'ascending']
    ])
    .exec(function (err, users) {
      if (err) { return next(err); }
      res.render('user-list', { title: 'Users', users: users });
  });
};

// Display detail page for a specific User.
exports.userDetail = function(req, res) {
    res.send('NOT IMPLEMENTED: User detail: ' + req.params.id);
};

// Display User create form on GET.
exports.userCreateGet = function(req, res, next) {
  res.render('user-form', { title: 'Create User' });
};

// Handle User create on POST.
exports.userCreatePost = [

  // Validate and sanitise fields
  body('name').trim().escape(),
  body('first_name').isLength({ min: 1 }).trim().withMessage('First name must not be empty.').trim().escape(),
  body('family_name').isLength({ min: 1 }).trim().withMessage('Family name must not be empty.').trim().escape(),
  body('email').isLength({ min: 1 }).trim().withMessage('Email must not be empty.')
    .isEmail().withMessage('The email is not a valid email address.').trim().escape(),

  // Process request after validation and sanitisation.
  (req, res, next) => {
      
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a User object with escaped and trimmed data.
    var user = new User(
      { 
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        email: req.body.email
      });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitised values/error messages.

      res.render('user-form', { title: 'Create User', user: user, errors: errors.array() });
    }
    else {
      
      // Data from form is valid
      user.save(function (err) {
        if (err) { return next(err); }
        res.redirect(user.urlList);
      });
    }
  }
];

// Display User delete form on GET.
exports.userDeleteGet = function(req, res, next) {

  User.findById(req.params.id)
    .exec(function(err, user) {
      if (err) { return next(err); }
      if (user == null) {
        res.redirect('/users/list');
      }
      // Successful, so render.
      res.render('user-delete', { title: 'Delete User', user: user } );
    });
};

// Handle User delete on POST.
exports.userDeletePost = function(req, res, next) {
  
  User.findById(req.body.id)
    .exec(function(err, user) {
      if (err) { return next(err); }
      // Delete the object and redirect
      User.findByIdAndRemove(req.body.id, function (err) {
        if (err) { return next(err); }
        res.redirect('/users/list')
      })
    });
};

// Display User update form on GET.
exports.userUpdateGet = function(req, res, next) {
  
  // Get the user to update
  User.findById(req.params.id)
    .exec(function(err, user) {
      if (err) { return next(err); }
      if (user == null) {
        var err = new Error('User not found');
        err.status = 404;
        return next(err);
      }
      res.render('user-form', { title: 'Update User', user: user, update: true });
    });
};

// Handle User update on POST.
exports.userUpdatePost = [
    
  // Validate and sanitise fields
  body('name').trim().escape(),
  body('first_name').isLength({ min: 1 }).trim().withMessage('First name must not be empty.').trim().escape(),
  body('family_name').isLength({ min: 1 }).trim().withMessage('Family name must not be empty.').trim().escape(),
  body('email').isLength({ min: 1 }).trim().withMessage('Email must not be empty.')
    .isEmail().withMessage('The email is not a valid email address.').trim().escape(),

  // Process request after validation and sanitisation.
  (req, res, next) => {
      
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a User object with escaped and trimmed data.
    var user = new User(
      { 
        _id:req.params.id,first_name: req.body.first_name,
        family_name: req.body.family_name,
        email: req.body.email
      });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitised values/error messages.
      res.render('user-form', { title: 'Update User', user: user, update: true, errors: errors.array() });
    }
    else {
      
      // Data from form is valid
      User.findByIdAndUpdate(req.params.id, user, {}, function (err, user) {
        if (err) { return next(err); }
        res.redirect(user.urlList);
      });
    }
  }
];