var express = require('express');
var router = express.Router();
var models = require('../models');
var User = models.User;
var Book = models.Book;
var depts = require('../departments');

//////////////////////////////// PUBLIC ROUTES ////////////////////////////////
// Users who are not logged in can see these routes

router.get('/', function(req, res, next) {
  res.render('home');
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
// Only logged in users can see these routes
//what we have to do is .populate the books and the users.
//then we have to do below except books: books
// User.find(function(err, users) {
  //   if (err) return next(err);
  //   res.render('users', {
  //     users: users
  //   });
  // });
router.get('/profile', function(req, res, next) {
  Book.find({owner: req.user._id})
    .then((books) => {
      res.render('profile', {
        username: req.user.username,
        books: books
        })
    })
});

router.post('/removebook/:id', function(req, res, next){
    var bookId = req.params.id;
    console.log('+++++++++++++++++');
      Book.findByIdAndRemove(bookId)
      .then(() => {
          console.log('----------');
          Book.find({
              owner: req.user._id})
              .then((books) => {
                  console.log('list of books', books);
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
    //books: books
  });
});

router.post('/addbook', function(req, res, next) {
  var book = new Book({
    title: req.body.title,
    author: req.body.author,
    department: req.body.department,
    price:  req.body.price,
    owner: req.user._id
  });
  book.save(function(err) {
    if (err) return next(err);
    res.redirect('/profile');
  })
});

router.get('/searchresults/:searchQuery/:dept', function(req, res, next) {
  res.render('searchresults', {
    //books:
  })
})

///////////////////////////// END OF PRIVATE ROUTES /////////////////////////////

module.exports = router;
