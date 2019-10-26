// Add Passport-related auth routes here.
var express = require('express');
var router = express.Router();
var models = require('../models');

module.exports = function(passport) {

  router.get('/fb/login', passport.authenticate('facebook'));

  router.get('/facebook/login/callback', passport.authenticate('facebook', {
      successRedirect: '/horizons',
      failureRedirect: '/fail'
  }));

router.get('/fail', function(req, res){
    res.status(401).send('Failed to login');
})
  // GET Logout page
  router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  return router;
};
