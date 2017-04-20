var http = require('http');
var aws = require('aws-sdk');

// config containing our slash command api token
var config = require('./config.json');

// Entrypoint for AWS Lambda
exports.handler = function(event, context) {
 var payloadData = {
    channel: "#general",
    username: "foosbot",
    icon_emoji: ":soccer:",
    text: 'hello world',
  };
  var payload = 'payload=' + JSON.stringify(payloadData);
  var options = {
    port: 443,
    host: 'hooks.slack.com',
    path: '/services/T52JDC3HU/B51JP3TRP/qeuwVmHahGEy9v2nX3MzyHc9',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': payload.length
    }
  };

  var req = http.request(options);

  req.write(payload);
  req.end();
};
