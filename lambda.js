var http = require('http');

var httpSender = require('lib/httpSender.js')
var slack = require('lib/slack.js')

// config containing our slash command api token
var config = require('./config.json');

// Entrypoint for AWS Lambda
exports.handler = function(event, context) {
  let message = event.text ? event.text.trim() : null;

  if (!message) {
    return context.fail('Message not sent properly');
  }

  payloadData = slack.formatMessage(message);
  httpSender.send(payloadData);

  return context.succeed('Slack message sent');
};
