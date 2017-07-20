console.log('CRON RUNNING')
var RtmClient = require('@slack/client').RtmClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var bot_token = process.env.SLACK_BOT_TOKEN || '';
var {User} = require('./models')
var {web} = require ('./bot')
var {Reminder} = require('./models')




var rtm = new RtmClient(bot_token);

rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
  Reminder.find().populate("user")
  .then(function(reminders) {
    console.log('REMINDERS', reminders)
    // reminders[0].user.slackId
  })

  rtm.sendMessage("sauce sequence initializing", channel);


});



User.findOne()
.then(function(user) {
  web.chat.postMessage(user.slackDmId, 'Current time is ' + new Date(),
  function() {
    process.exit(0)
  })
})
