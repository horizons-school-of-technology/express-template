var express = require('express');
var router = express.Router();
var models = require('../models');
var User = models.User;
var Book = models.Book;
var depts = require('../departments');

var public = process.env.PUBLIC_API;
var secret = process.env.SECRET_API;
var domain = process.env.DOMAIN;
var mailgun = require('mailgun-js')({apiKey: secret, domain: domain});

//////////////////////////////// PUBLIC ROUTES ////////////////////////////////
// Users who are not logged in can see these routes

router.get('/', function(req, res, next) {
    Book.find()
        .limit(4)
            .exec(function(err, books){
         if (err) return next(err);
        res.render('home', {
            books: books
        });
    });
});

router.get('/books', function(req, res, next){
    Book.find(function(err, books){
        if (err) return next(err);
        res.render('books', {
            books: books
        });
    });
});


router.post('/searchresults', function(req, res, next) {
  var title = req.body.titleinput;
  var or = title.split(" ").join('|');
  Book.find({ title: new RegExp(or, "i") })
  .then((books) => {
    res.render('searchresults', {
      books: books,
      title: title
    });
  })
});


///////////////////////////// END OF PUBLIC ROUTES /////////////////////////////

router.use(function(req, res, next){
  if (!req.user) {
    res.redirect('/login');
  } else {
    return next();
  }
});

//////////////////////////////// PRIVATE ROUTES ////////////////////////////////
router.get('/profile', function(req, res, next) {
  Book.find({owner: req.user._id})
    .then((books) => {
      res.render('profile', {
        username: req.user.username,
        books: books
        })
    })
});

router.get('/contactseller', function(req, res, next){
    res.render('contactseller');
});

router.post('/removebook/:id', function(req, res, next){
    var bookId = req.params.id;
    console.log(bookId);
      Book.findByIdAndRemove(bookId)
      .then(() => {
          Book.find({
              owner: req.user._id})
              .then((books) => {
                  res.render('profile', {
                    username: req.user.username,
                    books: books
                })
              })
    })
})


router.get('/addbook', function(req, res, next) {

  res.render('addbook', {
    username: req.user.username,
    depts: depts.depts
  });
});

router.post('/addbook', function(req, res, next) {
  var book = new Book({
    title: req.body.title,
    author: req.body.author,
    department: req.body.department,//jquery here??
    price:  req.body.price,
    owner: req.user._id,
    email: req.user.email
  });
  book.save(function(err) {
    if (err) return next(err);
    res.redirect('/profile');
  })
});

// router.get('/users', function(req, res, next) {
//   User.find(function(err, users) {
//     if (err) return next(err);
//     res.render('users', {
//       users: users
//     });
//   });
// });

router.post('/contactseller/:id', function(req, res, next) {
  var bookId = req.params.id;

  var book = Book.findById(bookId);
  var bookOwner = book.then(book => User.findById(book.owner));
  var currentUser = User.findById(req.user._id);

  Promise.all([book, bookOwner, currentUser]).then(
    arrOfThings => {
      var b = arrOfThings[0]
      var bo = arrOfThings[1]
      var cu = arrOfThings[2]
      res.render('contactseller', {
        book: b,
        bookOwner: bo,
        currentUser: cu
      })
    }
  )
});

router.post('/sendemail', function(req, res, next){
    var data = {
        from: req.body.sender,
        to: req.body.recipients,
        subject: "Bobcat Book Exchange",
        text: req.body.text
    }
        mailgun.messages().send(data, function(error, body) {
            Book.find({owner: req.user._id})
            .then((books) => {
                res.render('profile', {
                    username: req.user.username,
                    books: books,
                    emailSent: true
                })
            })
    })
})

///////////////////////////// END OF PRIVATE ROUTES /////////////////////////////

module.exports = router;
