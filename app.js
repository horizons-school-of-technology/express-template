var bot = require('./bot')
var express = require('express')
var app = express()
var bodyParser = require('body-parser')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/messages', function(req, res) {
 var payload = JSON.parse(req.body.payload);  //lets us access the action they picked on the button
 console.log(payload)
 if(payload.actions[0].value === 'true') {
   res.send('Created reminder');
 } else {
   res.send('Cancelled')
 }
});

app.listen(3000)
