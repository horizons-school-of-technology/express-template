var RtmClient = require('@slack/client').RtmClient;
var WebClient = require('@slack/client').WebClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
// var token = process.env.SLACK_API_TOKEN || ''; //see section above on sensitive data
var bot_token = process.env.SLACK_BOT_TOKEN || '';
console.log("BOT TOKEN", bot_token)
var rtm = new RtmClient(bot_token); //initializing slack library, listeners
var web = new WebClient(bot_token);
var axios = require('axios')
var API_AI_TOKEN = process.env.API_AI_TOKEN
let channel;
var { User } = require('./models');

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  for (const c of rtmStartData.channels) {
    if (c.is_member && c.name ==='general') { channel = c.id }
  }

  console.log(`Logged in as ${rtmStartData.self.name}
    of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});

rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
  rtm.sendMessage("Hello000s000ooooo!", channel);
});

//curl 'https://api.api.ai/api/query?v=20150910&query=jlkj&lang=en&sessionId=05b18dc6-40c3-4e06-97dd-14e9e72d07cd&timezone=2017-07-17T16:55:52-0700' -H 'Authorization:Bearer ca43f35e1ad745a2af4fc67e46c65669'

rtm.on(RTM_EVENTS.MESSAGE, function(message) {
  var dm = rtm.dataStore.getDMByUserId(message.user)
  console.log("a")
  if(!dm || dm.id !== message.channel || message.type !== 'message') {
    return;
  }
  // rtm.sendMessage(message.text, message.channel)
  User.findOne({slackId: message.user})
  .then(function(user){

    if (! user) {
      return new User({
        slackId: message.user,
        slackDmId: message.channel
        //make sure that you now have mlab setup.  this requires mongodb
      }).save()
    }
    return user;
  })
  .then(function(user){
    if(!user.google || user.google.expiry_date < Date.now() ){
      rtm.sendMessage(`Hello,
        This is Schedule Bot.  In order to schedule reminders for you, I
        need access to your Google Calandar.
        ${process.env.DOMAIN}connect?user=${user._id} to setup Google Calendar`, message.channel);
        return;
        //replace this w heroku url
      }
      else {
        axios.get('https://api.api.ai/api/query', { //makes an http request to this url (just like ajax)
          params: {
            v: 20150910,
            lang: 'en',
            timezone: '2017-07-17T16:55:52-0700',
            query: message.text,
            sessionId: message.user,
          },
          headers: {
            Authorization: `Bearer ${process.env.API_AI_TOKEN}`
          }
        })
        .then(function({ data }) {
          if(data.result.actionIncomplete) {
            rtm.sendMessage(data.result.fulfillment.speech, message.channel);

            //should work w the API AI business
          } else {
            console.log('ACTION ISjjj COMPLETE', data)

            user.pending = {
              subject: data.result.parameters.subject,
              date: data.result.parameters.date
            }

            user.save()

            web.chat.postMessage(message.channel, `Creating reminder for ${data.result.parameters.subject} on ${data.result.parameters.date}`, {
              "text": "Confirm this reminder???",
              "attachments": [
                {
                  "text": "Confirm this reminder?",
                  "fallback": "You are unable to confirm",
                  "callback_id": "wopr_game",
                  "color": "#3AA3E3",
                  "attachment_type": "default",
                  "actions": [
                    {
                      "name": "confirm",
                      "text": "confirm",
                      "type": "button",
                      "value": "true"
                    },
                    {
                      "name": "cancel",
                      "text": "cancel",
                      "type": "button",
                      "value": "false"
                    }
                  ]
                }
              ]
            })
          }
        })
      }
    })
  })

  rtm.on(RTM_EVENTS.REACTION_ADDED, function handleRtmReactionAdded(reaction) {
    console.log('Reaction added:', reaction);
  });

  rtm.on(RTM_EVENTS.REACTION_REMOVED, function handleRtmReactionRemoved(reaction) {
    console.log('Reaction removed:', reaction);
  });


rtm.start();
// var port = process.env.PORT || '3000';
//   rtm.listen(port, function() {
//       console.log('port is running!')
//   })

module.exports = {
    rtm,
    web
}
