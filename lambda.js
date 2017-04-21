var http = require('https');

//var httpSender = require('./lib/httpSender.js')
//var slack = require('./lib/slack.js')

// config containing our slash command api token
var config = require('./config.json');

// Entrypoint for AWS Lambda
exports.handler = function(event, context) {
  let type = event.type;
  let content = event.content;

  if (event.payload) {
    type = 'player_joined';
    content = event.payload;
  }

  switch (type) {
    case 'players_needed':
      content = parseInt(content);
      payloadData = slack.formatPlayersNeeded(content);
      break;

    case 'player_joined':
      payloadData = slack.playerJoinedHandler(content);
      return payloadData;

    case 'message':
    default:
      payloadData = slack.formatMessage(content);
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
    var numberStr;

    switch (numberOfPlayer) {
      case 1:
        numberStr = 'one player';
        break;
      case 2:
        numberStr = 'two players';
        break;
      case 3:
      default:
        numberStr = 'three players';
        break;
    }

    let actions = [];

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

  playerJoinedHandler: function (rawPayload) {
    var stringResponse = decodeURIComponent(rawPayload);
    var payloadJson = JSON.parse(stringResponse);
    var user = payloadJson.user.name;
    var player = payloadJson.actions.value;
    var payloadResponse = payloadJson.original_message;
    var payloadActions = payloadResponse.attachments;

    for (p of payloadActions) {
      if (p.actions) {
        for (a of p.actions) {
          if (a.value === player) {
            a.name = 'player' + k,
            a.text = user;
            a.type = 'text';
            break;
          }
        }
      }
    }

    payloadResponse.attachments = payloadActions;

    return payloadResponse;
  },
  /*

  sendMessageBackToSlack: function (responseURL, jsonMessage) {
    var postOptions = {
      uri: responseURL,
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      json: JSONmessage
    };

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
  */

};
