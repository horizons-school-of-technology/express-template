// Add Passport-related auth routes here.
var express = require('express');
var router = express.Router();
var models = require('../models');
var _ = require('underscore');


module.exports = function(passport) {

  // GET registration page
  router.get('/signup', function(req, res) {
    res.render('signup');
  });

  router.post('/signup', function(req, res) {
    // validation step
    if (req.body.password!==req.body.passwordRepeat) {
      return res.render('signup', {
        error: "Passwords don't match."
      });
    }
    if (req.body.email.substr(req.body.email.length-3) !== 'edu') {
      return res.render('signup', {
        error: "Please enter a valid .edu email address."
      })
    }
    //hash
    var params = _.pick(req.body, ['username', 'password', 'email']);
    // bcrypt.genSalt(10, function(err, salt) {
    //   bcrypt.hash(params.password, salt, function(err, hash) {
    //     // Store hash in your password DB.
    //     params.password = hash;
        Object.assign(params);
        models.User.create(params, function(err, user) {
          if (err) {
            res.status(400).json({
              success: false,
              error: err.message
            });
          } else {
            console.log(user);
            res.redirect('/login')
          }
        });
});


  // GET Login page
  router.get('/login', function(req, res) {
    res.render('login');
  });

  // POST Login page
  router.post('/login', passport.authenticate('local',{
    successRedirect: '/profile',
    failureRedirect: '/login'
  }));

  // GET Logout page
  router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  return router;
};
