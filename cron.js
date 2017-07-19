console.log('CRON RUNNING')

var {User} = require('./models')
var {web} = require ('./bot')

User.findOne()
.then(function(user) {
  web.chat.postMessage(user.slackDmId, 'Current time is ' + new Date(),
  function() {
    process.exit(0)
  })
})
