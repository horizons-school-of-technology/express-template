
<<<<<<< HEAD
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('endpointof ngrok', function(req, res) {
  res.send('received :fire:')
  var payload = JSON.parse(req.body.payload);  //lets us access the action they picked on the button
  if(payload.actions[0].value === "true") {
    res.send('Created reminder');
  } else {
    res.send('Cancelled')
  }
});
=======
>>>>>>> 2511961dc077b091d577a8f95db05cb1bbc75689
