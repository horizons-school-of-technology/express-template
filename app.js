var bot = require('./bot')
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var mongoose = require('mongoose');
var express = require('express');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var { User } = require('./models');
var moment

mongoose.connection.on('connected', function() {
  console.log('yay, connected')
});
mongoose.connection.on('error', function() {
  console.log('o no could not connect to database')
});
mongoose.connect(process.env.MONGODB_URI)

function getGoogleAuth(){
  return new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.DOMAIN+'connect/callback'
  )
}

const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/calendar'
];

app.post('/messages', function(req, res) {
  var payload = JSON.parse(req.body.payload);
  if(payload.actions[0].value === 'true') {
    User.findOne({slackId: payload.user.id})
    .then(function(user) {
      var googleAuth = getGoogleAuth()
      var credentials = Object.assign({}, user.google)
      delete credentials.profile_id;
      delete credentials.profile_name;
      googleAuth.setCredentials(user.google)
      var calendar = google.calendar('v3')
      calendar.events.insert({
        auth: googleAuth,
        calendarId: 'primary',
        resource: {
          summary: user.pending.subject,
          start: {
            date: user.pending.date,
            timezone: 'America/Los_Angeles'
          },
          end: {
            date: user.pending.date,
            // date: moment(user.date).add(1, 'days').format('YYYY-MM-DD')
            timezone: 'America/Los_Angeles'
          }
        }
      },
      function(err, result) {
        if(err) {
          user.pending = {}
          console.log("/messages error: ", err)
          res.send("there was an error sending to google cal")
        }
        else {
          user.pending = {}
          res.send('Great! Added to Calendar')
        }
      })
    })
  } else {
    res.send('Cancelled')
  }
})


//require some things
//npm install google oath client
//go to console.cloud.com and go to create credentials.  web app. name it.  give it authroized redirect url
//http://localhost3000/connect/callback
//and just local hoast
//in env.sh make


app.get('/connect', function(req, res){
  var userId = req.query.user;
  if (!userId ){
    res.status(400).send('Missing user id');
  }
  else {
    console.log("RES!!!", res)
    User.findById(userId)
    .then(function(user){
      if (! user){
        res.status(404).send('cant find user')
      }
      else {
        var googleAuth = getGoogleAuth();
        var url = googleAuth.generateAuthUrl({
          access_type: 'offline',
          prompt: 'consent',
          scope: GOOGLE_SCOPES,
          state: userId
        })
        console.log("URL IS", url)
        res.redirect(url);
      }
    });
  }
});

app.get('/connect/callback', function(req, res){
  var googleAuth = getGoogleAuth();
  googleAuth.getToken(req.query.code, function(err, tokens){
    if (err) {
      res.status(500).json({error: err});
    }
    else{
      googleAuth.setCredentials(tokens);
      var plus = google.plus('v1');
      plus.people.get({auth: googleAuth, userId: 'me'}, function(err, googleUser){
        if (err){
          res.status(500).json({error: err});
        }
        else{
          //MIGHT BE A PROBLEM: AUTH_ID, JSON.PARSE DECODE
          console.log('REQ QEURY SATAE', req.query.state)
          console.log("json", decodeURIComponent(req.query.state))
          console.log('eEXPRIY', res.expiry_date)
          User.findById(req.query.state)
          .then(function(mongoUser){
            mongoUser.google = tokens;
            mongoUser.google.profile_id = googleUser.id;
            mongoUser.google.profile_name = google.displayName;
            return mongoUser.save();
          })
          .then(function(mongoUser){
            res.send('youre connected to google cal!');
            rtm.sendMessage('you are connected to google calandar');
          })
        }
      })
    }
  });
});

app.listen(process.env.PORT || 3000); //listen on process.env.PORT || 3000
