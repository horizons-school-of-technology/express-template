var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');
var connect = process.env.MONGODB_URI;
mongoose.connect(connect);

// Step 1: Create and edit contacts
// Remember: schemas are like your blueprint, and models
// are like your building!
var contactSchema = mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  owner: String
});

var userSchema = mongoose.Schema({
  username: String,
  password: String,
  phone: String,
  facebookId: String
});
userSchema.plugin(findOrCreate);

var messageSchema = mongoose.Schema({
  created: Date,
  content: String,
  user: String,
  contact: String,
  channel: String
});

module.exports = {
    Contact: mongoose.model('Contact', contactSchema),
    User: mongoose.model('User', userSchema),
    Message: mongoose.model('Message', messageSchema)
};
