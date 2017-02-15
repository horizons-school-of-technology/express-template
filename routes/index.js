var express = require('express');
var accountSid = process.env.ACCOUNT_SID;
var authToken = process.env.AUTH_TOKEN;
var fromPhone = process.env.FROM_PHONE;
var fromEmail = process.env.FROM_EMAIL;
var twilio = require('twilio')(accountSid, authToken);
var sendgrid = require('sendgrid');
var router = express.Router();
var multer  = require('multer');
var upload = multer();
var models = require('../models/models');
var Contact = models.Contact;
var Message = models.Message;
var User = models.User;

router.post('/messages/receive', function(req, res, next) {
  User.findOne({phone: fromPhone.substring(2)}, function(err, user) {
    Contact.findOne({phone: req.body.From.substring(2)}, function(err, contact) {
      console.log(user, contact);
      if(err) return next(err);
      var message = new Message({
        created: new Date(),
        content: req.body.Body,
        user: user._id,
        contact: contact._id
      });
      message.save(function(err) {
        if(err) return next(err);
        res.send("Thanks Twilio <3");
      });
    })
  });
});

router.post('/messages/receive_email', upload.array(), function(req, res, next) {
  console.log("Got email: " + JSON.stringify(req.body));
  res.send("Thanks sendgrid <3");

  // TODO: matching users and contacts using email from: and to: is hard =\
});

router.use(function(req, res, next){
  if (!req.user) {
    res.redirect('/login');
  } else {
    return next();
  }
});

/* GET home page. */
router.get('/contacts', function(req, res, next) {
  // Load all contacts (that this user has permission to view).
  Contact.find(function(err, contacts) {
    if (err) return next(err);
    res.render('contacts', {
      contacts: contacts
    });
  });
});

router.get('/contacts/new', function(req, res, next) {
  res.render('editContact');
});

router.get('/contacts/:id', function(req, res) {
  Contact.findById(req.params.id, function(err, contact) {
    if (err) return next(err);
    res.render('editContact', {
      contact: contact
    });
  });
});

router.post('/contacts/new', function(req, res, next) {
  var contact = new Contact({
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email
  });
  contact.save(function(err) {
    if (err) return next(err);
    res.redirect('/contacts');
  })
});

router.post('/contacts/:id', function(req, res, next) {
  Contact.findById(req.params.id, function(err, contact) {
    if (err) return next(err);
    contact.name = req.body.name;
    contact.phone = req.body.phone;
    contact.save(function(err) {
      if (err) return next(err);
      res.redirect('/contacts');
    });
  });
});

router.get('/messages', function(req, res, next) {
  Message.find({user: req.user._id}, function(err, messages) {
    if (err) return next(err);
    res.render('messages', {
      messages: messages
    });
  });
});

router.get('/messages/:id', function(req, res, next) {
  Contact.findById(req.params.id, function(err, contact) {
    if (err) return next(err);
    Message.find({user: req.user._id, contact: req.params.id}, function(err, messages) {
      if (err) return next(err);
      res.render('messages', {
        messages: messages,
        contact: contact
      });
    });
  });

});

router.get('/messages/send/:id', function(req, res, next) {
  Contact.findById(req.params.id, function(err, contact) {
    res.render('newMessage', {
      contact: contact
    });
  });
});

router.post('/messages/send/:id', function(req, res, next) {
  Contact.findById(req.params.id, function(err, contact) {
    if (err) return next(err);

    var message = new Message({
      created: new Date(),
      content: req.body.message,
      user: req.user._id,
      contact: contact._id
    });

    // Check the channel
    if (req.body.channel==="email") {
      var
        helper = sendgrid.mail,
        from_email = new helper.Email(fromEmail),
        to_email = new helper.Email(contact.email),
        subject = "New message from Double Message",
        content = new helper.Content("text/plain", req.body.message),
        mail = new helper.Mail(from_email, subject, to_email, content);

      var sg = sendgrid.SendGrid(process.env.SENDGRID_API_KEY);
      var requestBody = mail.toJSON();
      var request = sg.emptyRequest();
      request.method = 'POST';
      request.path = '/v3/mail/send';
      request.body = requestBody;
      sg.API(request, function (response) {
        console.log(response.statusCode);
        console.log(response.body);
        console.log(response.headers);
        message.channel = "email";
        message.save(function(err) {
          if(err) return next(err);
          res.redirect('/messages/' + req.params.id)
        });
      });
    }
    else {
      twilio.messages.create({
        to: "+1" + contact.phone,
        from: fromPhone,
        body: req.body.message
      }, function(err, msg) {
        if (err) return next(err);
        message.channel = "sms";
        message.save(function(err) {
          if(err) return next(err);
          res.redirect('/messages/' + req.params.id)
        });
      })
    }
  });
});

module.exports = router;
