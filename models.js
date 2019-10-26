var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  username: String,
  password: String,
  email: String,
  phone: String,
  booksOwned: Array
});
User = mongoose.model('User', userSchema);
//after we add a book, I need to add that book to the user scheme via helper function.
const bookSchema = mongoose.Schema({
    email: String,
    owner: String,
    title: String,
    author: String,
    department: String,
    price: String,
});
const Book = mongoose.model('Book', bookSchema);

module.exports = {
    User: User,
    Book: Book
};
