var express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  flash = require('connect-flash'),
  passport = require('passport'),
  LocalStrategy = require('passport-local'),
  methodOverride = require('method-override'),
  User = require('./models/user'),
  seedDB = require('./seeds.js')
  connectDB= require('./config/db')

connectDB // connecting to mongoDB atlas

// Requireing routes using router
var commentRoutes = require('./routes/comments'),
  campgroundRoutes = require('./routes/campgrounds'),
  indexRoutes = require('./routes/index')


app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))
app.use(methodOverride('_method'))
app.use(flash())

//seed the Database
// seedDB

app.locals.moment = require('moment')
// PASSPORT CONFIG
app.use(
  require('express-session')({
    secret: 'Learning is a daily process',
    resolve: false,
    saveUninitialized: false,
    resave: true,
  })
)
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//Middleware to send user name to header
app.use(function (req, res, next) {
  res.locals.currentUser = req.user
  res.locals.error = req.flash('error')
  res.locals.success = req.flash('success')
  next()
})

app.use('/', indexRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/comments', commentRoutes)

app.listen(3000, function (req, res) {
  console.log('Server Started')
})
