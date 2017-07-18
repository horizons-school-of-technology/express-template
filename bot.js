var RtmClient = require('@slack/client').RtmClient;
var WebClient = require('@slack/client').WebClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
// var token = process.env.SLACK_API_TOKEN || ''; //see section above on sensitive data
var bot_token = process.env.SLACK_BOT_TOKEN || '';
var rtm = new RtmClient(bot_token); //initializing slack library, listeners
var web = new WebClient(bot_token);
var axios = require('axios')
var API_AI_TOKEN = process.env.API_AI_TOKEN
let channel;

//RTM
// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  for (const c of rtmStartData.channels) {
    if (c.is_member && c.name ==='general') { channel = c.id }
  }

  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});

// you need to wait for the client to fully connect before you can send messages
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
  rtm.sendMessage("Hello000s000ooooo!", channel);
});

//curl 'https://api.api.ai/api/query?v=20150910&query=jlkj&lang=en&sessionId=05b18dc6-40c3-4e06-97dd-14e9e72d07cd&timezone=2017-07-17T16:55:52-0700' -H 'Authorization:Bearer ca43f35e1ad745a2af4fc67e46c65669'

rtm.on(RTM_EVENTS.MESSAGE, function(message) {
  var dm = rtm.dataStore.getDMByUserId(message.user)
  if(!dm || dm.id !== message.channel || message.type !== 'message') {
    return;
  }
  // rtm.sendMessage(message.text, message.channel)
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
    console.log('DATA IS', {data})
    if(data.result.actionIncomplete) {
      rtm.sendMessage(data.result.fulfillment.speech, message.channel);
      //should work w the API AI business
    } else {
      console.log('ACTION IS COMPLETE', data.result.parameters)
      web.chat.postMessage(message.channel, `Creating reminder for ${data.result.parameters.description} on ${data.result.parameters.date}`, {
        "text": "Would you like to play a game?",
        "attachments": [
          {
            "text": "Choose a game to play",
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
              {
                "name": "confirm",
                "text": "Confirm",
                "type": "button",
                "value": "true"
              },
              {
                "name": "game",
                "text": "Falken's Maze",
                "type": "button",
                "value": "maze"
              }
            ]
          }
        ]
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

//WEB
web.chat.postMessage('C1232456', 'Hello there', function(err, res) {
  if (err) {
    console.log('Error:', err);
  } else {
    console.log('Message sent: ', res);
  }
});
// module.exports = rtm;
