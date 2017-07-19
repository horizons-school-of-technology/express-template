var mongoose = require('mongoose');
mongoose.Promise = global.Promise
mongoose.connect(process.env.MONGODB_URI);

var User = mongoose.model('User', {
    slackId: {
        type: String,
        required: true
    },
    slackDmId: {
        type: String,
        required: true
    },
    google: {},
    pending: {

    }
});

// var Task = mongoose.model('Task', {
//   required: {
//     subject: String,
//     day: Date,
//   },
//   eventId: String,
//   requesterId: String
// })

module.exports = {
    User
}
