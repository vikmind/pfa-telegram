require('dotenv-safe').load()
const Telegraf = require('telegraf')
const gapi = require('./gapi');
const { Extra } = require('Telegraf');

const app = new Telegraf(process.env.BOT_TOKEN)
const markup = Extra.HTML();

app.command('start', ({ from, reply }) => {
  const link = gapi.getLink(from.username);
  return reply(`Welcome ${from.username}! Send code from this <a href="${link}">link</a> for authorization.`);
});
app.command('auth', ({ from, reply }) => {
  const link = gapi.getLink(from.username);
  return reply(`Send code from this <a href="${link}">link</a> for authorization.`);
});
app.command('help', ({ reply }) =>
  reply('<b>Message format</b>:\nSUM CATEGORY; &lt;DESCRIPTION&gt; | &lt;DATE&gt;', markup)
);
app.hears(/(.*)/, ({ match, from, reply }) => {
  if (!gapi.isAuthorized(from.username)) {
    return gapi.authorize(from.username, match[1])
      .then(() => reply('You successfully authorized, run \/help for available commands'))
      .catch(e => reply(`Can't authorize you, because: <b>${e.message}</b>`, markup))
  }
});
app.hears(/([\d\+\-]+)\s([\w\s]+)(?:(?:;\s)([\w\s]*))?(?:(?:\s?\|\s?)(.*))?/, ({ match, from, reply }) => {
  if (gapi.isAuthorized(from.username)) {
    const data = {
      amount: match[1],
      category: match[2],
      description: match[3],
      date: match[4] || (new Date).toJSON().slice(0, 10),
    };
    return gapi.append(from.username, data)
      .then(() => reply('Done!'))
      .catch(e => reply(`Can't do this, because: <b>${e.message}</b>`, markup))
  } else {
    // Reauthorize
  }
});
console.log('start listening');
app.startPolling()