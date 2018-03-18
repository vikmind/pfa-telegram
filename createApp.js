module.exports = function({
  Telegraf,
  gapi,
  webroot,
  token,
}) {
  const app = new Telegraf(token)
  const markup = Telegraf.Extra.HTML();
  const path = 'pfa-bot-webhook-listener';
  const Markup = Telegraf.Markup;

  app.command('start', ({ from, reply }) =>
    gapi.getClient(from.username)
      .then(client =>
        reply(`Welcome ${from.username}! Send code from this <a href="${gapi.getLink(client)}">link</a> for authorization.`, markup))
      .catch(e => reply(`Can't do this, because: <b>${e.message}</b>`, markup))
  );
  // Authorization
  app.command('auth', ({ from, reply }) =>
    gapi.getClient(from.username)
      .then(client =>
        reply(`Send code from this <a href="${gapi.getLink(client)}">link</a> for authorization.`, markup))
      .catch(e => reply(`Can't do this, because: <b>${e.message}</b>`, markup))
  );
  // Adding data to spreadsheet
  app.action(/set_category_(.+)\|(.+)\|(.+)/, async ({ match, from, reply, editMessageText, answerCbQuery }) => {
    editMessageText(`Done! ${match[1]}: ${match[3]}; ${match[2]}`);
    return gapi.getClient(from.username)
      .then(client => gapi.append(client, {
        amount: match[1],
        category: match[2],
        description: match[3],
        date: (new Date).toJSON().slice(0, 10),
      }))
      .then(msg => answerCbQuery('Done!'))
      .catch(e => reply(`Can't do this, because: <b>${e.message}</b>`, markup))
  });
  // <Value> <Description>
  app.hears(/([\d\.\+\-\*]+)\s([,а-яА-Я\w\s]+)/, ({ match, from, reply }) => {
    const amount = match[1];
    const description = match[2];
    return gapi.getClient(from.username)
      .then(client => gapi.categories(client))
      .then(categories =>
          reply(
            `Set category for ${amount} ${description}`,
            Markup.inlineKeyboard(
              categories.map(cat => Markup.callbackButton(cat[0], `set_category_${amount}|${cat[0]}|${description}`)),
              { columns: 2 }
            ).extra()
          )
      )
      .catch(e => reply(`Can't do this, because: <b>${e.message}</b>`, markup))
  });
  // Help
  app.command('help', ({ reply }) =>
    reply('<b>Message format</b>:\nSUM DESCRIPTION (for example, 1000 Sushi)', markup)
  );
  // Auth key
  app.hears(/(.*)/, ({ match, from, reply }) =>
    gapi.getClient(from.username)
      .then(client => gapi.authorize(client, from.username, match[1]))
      .then(status => (status !== 'already')
          ? reply('You successfully authorized, run \/help for available commands')
          : null)
      .catch(e => reply(`Can't authorize you, because: <b>${e.message}</b>`, markup))
  );

  return {
    app,
    start(port) {
      app.telegram.setWebhook(`${webroot}/${path}`);
      app.startWebhook(`/${path}`, null, port);
    },
    startPolling() {
      app.telegram.deleteWebhook();
      app.startPolling();
    },
  };
};
