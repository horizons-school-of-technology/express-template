var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');
var connect = process.env.MONGODB_URI;
mongoose.connect(connect);

var userSchema = mongoose.Schema({
  username: String,
  password: String,
  phone: String,
  facebookId: String
});
userSchema.plugin(findOrCreate);

User = mongoose.model('User', userSchema);

module.exports = {
    User:User
};
