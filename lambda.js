var http = require('https');
var request = require('request');

//var httpSender = require('./lib/httpSender.js')
//var slack = require('./lib/slack.js')

// config containing our slash command api token
var config = require('./config.json');

// Entrypoint for AWS Lambda
exports.handler = function(event, context, callback) {
  let type = event.type;
  let content = event.content;

  if (event.payload) {
    type = 'player_joined';
    content = event.payload;
  }

  switch (type) {
    case 'players_needed':
      console.log('player_needed');
      content = parseInt(content);
      payloadData = slack.formatPlayersNeeded(content);
      break;

    case 'player_joined':
      console.log('player_joined');

      let contentString = decodeURIComponent(content);
      let contentJson = JSON.parse(contentString);

      let message = slack.playerJoinedResponseMessage(contentJson);

      console.log('callback message: '+ message);

      callback(null, message);
      return;

    case 'message':
    default:
      console.log('message');
      payloadData = slack.formatMessage(content, event.timestamp);
  }

  httpSender.send(payloadData);
};

var httpSender = {
  send: function(payloadData) {
    var payload = 'payload=' + JSON.stringify(payloadData);
    var options = {
      port: 443,
      host: 'hooks.slack.com',
      path: '/services/T02SWPEUM/B51M0G87J/mrdotF9EKOhJjlKNTxdWEJzh',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': payload.length
      }
    };

    var req = http.request(options);

    req.write(payload);
    req.end();
  },
}

var slack = {
  formatMessage: function(message) {
    var payloadData = {
      text: message,
    }

    return payloadData;
  },

  formatPlayersNeeded: function(numberOfPlayer) {
    var numberStr = slack.getNumberString(numberOfPlayer);

    let actions = slack.getActions(numberOfPlayer);

    var payloadData = {
      attachments: [
        {
          text: '*Foosball?*',
          mrkdwn_in: ['text', 'pretext'],
          color: '#053B79',
        },
        {
          text: 'Need ' + numberStr + '.',
          callback_id: 'foos_game',
          color: '#CE0342',
          attachment_type: 'default',
          thumb_url: 'https://emoji.slack-edge.com/T02SWPEUM/foosball/23aac20844b52526.jpg',
          actions: actions,
        }
      ]
    };

    return payloadData;
  },

  getActions: function (numberOfPlayer) {
    var actions = [];
    for (let k = 1; k <= numberOfPlayer; k++) {
      if (k > 3) {
        break;
      }

      actions.push({
        name: 'player' + k,
        text: 'Player ' + k,
        type: 'button',
        value: 'player' + k,
      });
    }

    return actions;
  },

  getNumberString: function (numberOfPlayer) {
    switch (parseInt(numberOfPlayer)) {
      case 1: return 'one player';
      case 2: return 'two players';
      case 3:
      default:
        return 'three players';

    }
  },


  playerJoinedResponseMessage: function (payload) {
    console.log('playerJoinedResponseMessage');
    var userJoined = payload.user.name;
    var originalMessage = payload.original_message;

    var numberOfPlayer = 0;

    if (originalMessage.attachments[1].text.indexOf('two')) {
      numberOfPlayer = 1;
    } else if (originalMessage.attachments[1].text.indexOf('three')) {
      numberOfPlayer = 2;
    }

    var numberOfPlayerString = "Don't need anymore players!";
    if (numberOfPlayer) {
      numberOfPlayerString = "Need " + slack.getNumberString(numberOfPlayer) + '.';
    }

    originalMessage.attachments[1].text = numberOfPlayerString;
    originalMessage.attachments[1].actions = slack.getActions(numberOfPlayer);

    originalMessage.attachments.push({
      text: '*_' + userJoined + '_* has joined the game.',
      mrkdwn_in: ['text'],
      color: '#053B79',
    });

    return originalMessage;
  },

};
