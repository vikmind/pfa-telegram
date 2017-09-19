const Telegraf = require('telegraf')
require('dotenv-safe').load()

const app = new Telegraf(process.env.BOT_TOKEN)
const state = {}
app.command('start', ({ from, reply }) => {
  console.log('start', from)
  return reply(`Welcome ${from.username}!`)
})
app.command('add', ({ from, reply }) => {
  state[from.username] = { listen: true, data: [] };
  return reply('I\'m listening, format is:\nSUM CATEGORY; <DESCRIPTION> | <DATE>');
});
app.command('end', ({ from, reply }) => {
  state[from.username] = { listen: false };
  // Send data
  return reply('End of input');
});
app.hears(/([\d\+\-]+)\s([\w\s]+)(?:(?:;\s)([\w\s]*))?(?:(?:\s?\|\s?)(.*))?/, ({ match, from, reply }) => {
  if (!!state[from.username]) {
    state[from.username].data.push({
      amount: match[1],
      category: match[2],
      description: match[3],
      date: match[4] || (new Date).toJSON().slice(0, 10),
    });
    return reply(JSON.stringify(state[from.username].data, null, 2));
  }
});
console.log('start listening');
app.startPolling()