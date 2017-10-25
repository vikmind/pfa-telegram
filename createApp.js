module.exports = function({
  Telegraf,
  gapi,
  webroot,
  token,
}) {
  const app = new Telegraf(token)
  const markup = Telegraf.Extra.HTML();
  const path = 'pfa-bot-webhook-listener';

  app.command('start', ({ from, reply }) =>
    gapi.getClient(from.username)
      .then(client =>
        reply(`Welcome ${from.username}! Send code from this <a href="${gapi.getLink(client)}">link</a> for authorization.`, markup))
      .catch(e => reply(`Can't do this, because: <b>${e.message}</b>`, markup))
  );
  app.command('auth', ({ from, reply }) =>
    gapi.getClient(from.username)
      .then(client =>
        reply(`Send code from this <a href="${gapi.getLink(client)}">link</a> for authorization.`, markup))
      .catch(e => reply(`Can't do this, because: <b>${e.message}</b>`, markup))
  );
  app.command('list', ({ from, reply }) =>
    gapi.getClient(from.username)
      .then(client => gapi.categories(client))
      .then(values => reply(values.join(',\n')))
      .catch(e => reply(`Can't do this, because: <b>${e.message}</b>`, markup))
  );
  app.command('help', ({ reply }) =>
    reply('<b>Message format</b>:\nSUM CATEGORY; &lt;DESCRIPTION&gt; | &lt;DATE&gt;', markup)
  );
  app.hears(/([\d\.\+\-\*]+)\s([,а-яА-Я\w\s]+)(?:(?:;\s)([,а-яА-Я\w\s]*))?(?:(?:\s?\|\s?)(.*))?/, ({ match, from, reply }) =>
    gapi.getClient(from.username)
      .then(client => gapi.append(client, {
        amount: match[1],
        category: match[2],
        description: match[3],
        date: match[4] || (new Date).toJSON().slice(0, 10),
      }))
      .then(msg => reply('Done!'))
      .catch(e => reply(`Can't do this, because: <b>${e.message}</b>`, markup))
  );
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
