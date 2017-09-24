# PFA Telegram bot

Send your spendings to bot and it will add them to specified stylesheet.

## Quick start

1. Add google credentials as described in [Google Sheets API Node.js Quickstart](https://developers.google.com/sheets/api/quickstart/nodejs#step_1_turn_on_the_api_name) and place ``client_secret.json`` in working dir.
1. Create your bot with [@botfather](https://telegram.me/botfather)
1. Create stylesheet with template ``Monthly budget``
1. ``cp .env.example .env``
1. Fill ``.env`` with bot key and your stylesheet ID

## TODO

1. Store credentials in mongo
1. Move to custom backend