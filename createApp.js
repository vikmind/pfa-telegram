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
  const session = Telegraf.session;
  app.use(session());

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
  app.action(/set_category:(.+)/, async ({ session, match, from, reply, editMessageText, answerCbQuery }) => {
    const category = match[1];
    editMessageText(`Done! ${session.amount}: ${category}; ${session.description}`);
    return gapi.getClient(from.username)
      .then(client => gapi.append(client, {
        amount: session.amount,
        category: category,
        description: session.description,
        date: (new Date).toJSON().slice(0, 10),
      }))
      .then(msg => answerCbQuery('Done!'))
      .catch(e => reply(`Can't do this, because: <b>${e.message}</b>`, markup))
  });
  // <Value> <Description>
  app.hears(/([\d\.\+\-\*]+)\s([,а-яА-Я\w\s]+)/, ({ session, match, from, reply }) => {
    session.amount = match[1];
    session.description = match[2];
    return gapi.getClient(from.username)
      .then(client => gapi.categories(client))
      .then(categories =>
          reply(
            `Set category for ${session.amount} ${session.description}`,
            Markup.inlineKeyboard(
              categories.map(cat => Markup.callbackButton(cat[0], `set_category:${cat[0]}`)),
              { columns: 2 }
            ).extra()
          )
      )
      .catch(e => reply(`Can't do this, because: <b>${e.message}</b>`, markup))
  });
  // <Value> <Description>; <Category>
  app.hears(/([\d\.\+\-\*]+)\s([,а-яА-Я\w\s]+);\s([,а-яА-Я\w\s]+)/, ({ match, from, reply }) => {
    const amount = match[1];
    const description = match[2];
    const category = match[3];
    return gapi.getClient(from.username)
      .then(client => gapi.append(client, {
        amount: amount,
        category: category,
        description: description,
        date: (new Date).toJSON().slice(0, 10),
      }))
      .then(msg => reply('Done!'))
      .catch(e => reply(`Can't do this, because: <b>${e.message}</b>`, markup));
  });
  // Help
  app.command('help', ({ reply }) =>
    reply('<b>Message format</b>:\nSUM DESCRIPTION (for example, "1000 Sushi") or\nSUM DESCRIPTION; CATEGORY', markup)
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
      app.polling.offset = 0;
      app.telegram.deleteWebhook();
      app.startPolling();
    },
  };
};
