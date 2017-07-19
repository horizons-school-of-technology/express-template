var bot = require('./bot')
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var mongoose = require('mongoose');
var express = require('express');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

mongoose.connection.on('connected', function() {
  console.log('yay, connected')
});

mongoose.connection.on('error', function() {
  console.log('o no could not connect to database')
});

mongoose.connect(process.env.MONGODB_URI)

app.post('/messages', function(req, res) {
 res.send('received :fire:')
 var payload = JSON.parse(req.body.payload);  //lets us access the action they picked on the button
 if(payload.actions[0].value === 'true') {
   res.send('Created reminder');
 } else {
   res.send('Cancelled')
 }
});

//new app.post to capture json and send calandar data to google cal api (using payload)

var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var { User } = require('./models');

function getGoogleAuth(){
    return new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/connect/callback'
    )
}
//require some things
//npm install google oath client
//go to console.cloud.com and go to create credentials.  web app. name it.  give it authroized redirect url
//http://localhost3000/connect/callback
//and just local hoast
//in env.sh make
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/calendar'
];

app.get('/connect', function(req, res){
    var userId = req.query.user;
    if (!userId ){
        res.status(400).send('Missing user id');
    }
    else {
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

app.listen(3000);
