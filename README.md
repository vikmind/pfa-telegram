# Personal finances telegram bot

Send your spendings to bot and it will add them to specified spreadsheet.

## Preparation steps

1. Add google credentials as described in [Google Sheets API Node.js Quickstart](https://developers.google.com/sheets/api/quickstart/nodejs#step_1_turn_on_the_api_name), content of ``client_secret.json`` file is ``CLIENT_SECRET``
1. Create your bot with [@botfather](https://telegram.me/botfather), it's token is ``BOT_TOKEN``
1. Create spreadsheet with Google's template ``Monthly budget``, assign ``SHEET_ID`` variable to its ID

## Starting locally

1. ``cp .env.example .env``
1. Fill ``.env``:
    1. ``POLLING=true``: for local usage you can work without webhook's configuratoin
    1. ``STORAGE=file``: for quick start you shouldn't configure db
1. ``npm install``
1. ``npm start``

## Deploy to [Heroku](https://heroku.com)

You can deploy your own instance of this bot by following this steps:

1. Install [Heroku CLI](https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up)
1. Create project ``heroku create <your-name>``
1. Add postgress add-on ``heroku addons:create heroku-postgresql:hobby-dev``
1. Fill environment variables on project's dashboard:
    1. ``WEBHOOK_ROOT`` is the address of your project, like ``https://<your-name>.heroku.com``
    1. ``POLLING=false``: Apps on Heroku shut down from time to time, so you need to use webhooks.
    1. ``BOT_TOKEN``, ``SHEET_ID``, ``CLIENT_SECRET``: see above
    1. ``ADAPTER=standart``
    1. ``STORAGE=db``
1. ``git push heroku master``

## About adapters

I have slightly different spreadsheet from default template, so I have changed data-to-rows converters.
Feel free to create your own: maybe you will use this app for completely different purpose?
