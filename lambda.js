var http = require('https');

//var httpSender = require('./lib/httpSender.js')
//var slack = require('./lib/slack.js')

// config containing our slash command api token
var config = require('./config.json');

// Entrypoint for AWS Lambda
exports.handler = function(event, context) {
  let message = event.text ? event.text.trim() : null;

  payloadData = slack.formatMessage(message);
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
  }
}

var slack = {
  formatMessage: function(message) {
    var numberOfPlayer = 3;
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
        value: null,
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
  }
};
