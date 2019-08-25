const line = require('@line/bot-sdk');
const express = require('express');
const schedule = require('node-schedule');

// Flex Messages
const menuFlex = require('./flex/menuFlex');
const Scheduler = require('./Scheduler');

const dotenv = require('dotenv').config();

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS,
  channelSecret: process.env.CHANNEL_SECRET
};

const client = new line.Client(config);

const app = express();

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Berhasil Gan'
  });
});

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(result => res.json(result))
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
});

const schedulerObj = new Scheduler();

// event handler
async function handleEvent(event) {
  console.log(event);

  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  switch (event.message.text) {
    case '/maki':
      const profile = await client.getProfile(event.source.userId);

      const echo = {
        type: 'text',
        text: `Mieee`
      };
      // use reply API
      return client.replyMessage(event.replyToken, echo);
      break;
    case 'ngirim':
      // U5b8038d4acf2c3c808e89bd8fe75f281
      angka = 1;
      client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'Sudah Berhasil Di push'
      });
      return schedulerObj.schedulePush('pushMessage', '*/30 * * * * *', () =>
        client.pushMessage(event.source.userId, {
          type: 'text',
          text: 'Berhasil Push'
        })
      );
    case 'testF':
      return client.replyMessage(event.replyToken, menuFlex);
    case '!startPromosi':
      client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'Siap kak, aku bakalin promosi setiap 1 menit :D'
      });
      const schedulerActive = schedule.scheduleJob('*/5 * * * * *', () =>
        client.pushMessage(event.source.groupId, menuFlex)
      );
      return schedulerObj.setSchedule(schedulerActive);

    case '!stopPromosi':
      schedulerObj.cancelSchedule();
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'Sudah Berhasil Di cancel'
      });
  }
  // create a echoing text message
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
