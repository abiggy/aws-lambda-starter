// Example lib file that gets bundled with your Lambda.
const channel = '#general';
const user = {
  name: 'foosbot',
  icon: ':soccer:',
};

module.exports = {
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
