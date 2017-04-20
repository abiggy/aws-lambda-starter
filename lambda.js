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
      path: '/services/T52JDC3HU/B51JP3TRP/xzfVeMm1CIwA6OSb3fWEybiH',
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

// Example lib file that gets bundled with your Lambda.
const channel = '#general';
const user = {
  name: 'foosbot',
  icon: ':soccer:',
};

slack = {
  formatMessage: function(message) {
    var payloadData = {
      channel: channel,
      username: user.name,
      icon_emoji: user.icon,
      text: message,
    };

    return payloadData;
  }
};
