const createError = require('http-errors');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const logger = require('morgan');
const helmet = require('helmet');
const bcrypt = require('bcrypt');
const path = require('path');

const MongoStore = require('connect-mongo')(session);

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const loginController = require('./controllers/login-controller');


const app = express();

//Set up mongoose connection
const mongoDB = 'mongodb://Public:RGgY0R0SGtsHHYDc@bambucluster-shard-00-00-2vz9g.mongodb.net:27017,bambucluster-shard-00-01-2vz9g.mongodb.net:27017,bambucluster-shard-00-02-2vz9g.mongodb.net:27017/content-library?ssl=true&replicaSet=BambuCluster-shard-0&authSource=admin&retryWrites=true';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


// Use helmet for protection
app.use(helmet());

// Use sessions for login
app.use(session({
  secret: 'Content library',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Use public resources
app.use(express.static(path.join(__dirname, 'public')));

// Use Bootstrap, JQuery and Popper.js
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/js', express.static(__dirname + '/node_modules/popper.js/dist'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

// Set the login middleware
app.use('/users', loginController.requiresLogin);

// Route settings
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
