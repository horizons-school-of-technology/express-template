console.log('hellow im running')
//npm install cron
//heroku run npm run cron
//to choose frequency, go to heroku and add scheduling in add-ons
//add new job
//npm run cron
var { User } = require('/models');
var { web } = require('bot')

User.findOne()
    .then(function(user){
        web.chat.postMessage(user.slackDmId, 'currrent time is ' + new Date(),
        function(){
            process.exit(0); // this ends the script
        })
    })
