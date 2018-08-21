const clova = require('@line/clova-cek-sdk-nodejs');
const express = require('express');
const bodyParser = require('body-parser');
const line = require('@line/bot-sdk');

const client = new line.Client({
  channelAccessToken: '<Your Access Token>'
});

const clovaSkillHandler = clova.Client
  .configureSkill()
  .onLaunchRequest(responseHelper => {
    responseHelper.setSimpleSpeech({
      lang: 'ja',
      type: 'PlainText',
      value: '買い物メモです。何を買いますか？',
    });
  })
  .onIntentRequest(async responseHelper => {
    const intent = responseHelper.getIntentName();
    const userId = responseHelper.requestObject.session.user.userId;
    const target = responseHelper.getSlot("Target");

    switch (intent) {
      case 'ReminderIntent':
        //LINEプッシュ通知
        client.pushMessage(userId, {
          type: 'text',
          text: target + '買う'
        });

        responseHelper.setSimpleSpeech({
          lang: 'ja',
          type: 'PlainText',
          value: target + 'ですね。' + 'わかりました',
        });

        responseHelper.endSession();
        break;
    }
  })
  .onSessionEndedRequest(responseHelper => {
    // Do something on session end
  })
  .handle();

const app = new express();
const clovaMiddleware = clova.Middleware({ applicationId: "<Your Application Id>" });
// Use `clovaMiddleware` if you want to verify signature and applicationId.
// Please note `applicationId` is required when using this middleware.
app.post('/clova', clovaMiddleware, clovaSkillHandler);

// Or you can simply use `bodyParser.json()` to accept any request without verifying, e.g.,
//app.post('/clova', bodyParser.json(), clovaSkillHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on ${port}`));
