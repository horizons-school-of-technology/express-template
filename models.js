var mongoose = require('mongoose');
var connect = process.env.MONGODB_URI;
mongoose.connect(connect);

var userSchema = mongoose.Schema({
  username: String,
  password: String,
  phone: String
});



User = mongoose.model('User', userSchema);

module.exports = {
    User:User
};
