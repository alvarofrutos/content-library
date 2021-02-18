const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

var UserSchema = new Schema({
  firstName: { type: String, required: true, max: 100 },
  familyName: { type: String, required: true, max: 100 },

  email: { type: String, unique: true, required: true, max: 100 },

  password: { type: String },

  premium: { type: Boolean, required: true, default: false },
  admin: { type: Boolean, required: true, default: false },
});

// Virtual for user's full name
UserSchema.virtual('name').get(function () {
  return this.firstName + ' ' + this.familyName;
});

// Virtual URL
UserSchema.virtual('url').get(function () {
  return '/users/user/' + this._id;
});

// Virtual URL
UserSchema.virtual('urlEdit').get(function () {
  return '/users/user/' + this._id + '/update';
});

// Virtual URL
UserSchema.virtual('urlDelete').get(function () {
  return '/users/user/' + this._id + '/delete';
});

// Virtual URL
UserSchema.virtual('urlList').get(function () {
  return '/users/list';
});

// Authenticate input against database
UserSchema.statics.authenticate = function (email, password, next) {
  module.exports.findOne({ email: email }).exec(function (err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      var err = new Error('User not found.');
      err.status = 401;
      return next(err);
    }
    bcrypt.compare(password, user.password, function (err, result) {
      if (result === true) {
        return next(null, user);
      } else {
        var err = new Error('Incorrect password.');
        err.status = 401;
        return next(err);
      }
    });
  });
};

// Hashing the password before saving it to the database
UserSchema.pre('save', function (next) {
  var user = this;
  if (user.password) {
    bcrypt.hash(user.password, 10, function (err, hash) {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  } else {
    next();
  }
});

// Export model
module.exports = mongoose.model('User', UserSchema);
