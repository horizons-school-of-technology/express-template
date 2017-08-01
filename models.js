var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  username: String,
  password: String,
  email: String,
  phone: String
});
User = mongoose.model('User', userSchema);

const bookSchema = mongoose.Schema({
    owner: {
        ref: User,
        type: mongoose.Schema.Types.ObjectId
    },
    title: String,
    author: String,
    department: String,
    price: Number

});
const Book = mongoose.model('Book', bookSchema);

module.exports = {
    User: User,
    Book: Book
};
