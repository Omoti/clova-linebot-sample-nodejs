const clova = require('@line/clova-cek-sdk-nodejs');
const express = require('express');
const line = require('@line/bot-sdk');

const client = new line.Client({
  channelAccessToken: "YOUR_ACCESS_TOKEN" //Messaging APIのアクセストークン
});

const clovaSkillHandler = clova.Client
  .configureSkill()
  .onLaunchRequest(responseHelper => {
    responseHelper.setSimpleSpeech({
      lang: 'ja',
      type: 'PlainText',
      value: 'リマインダーです。何を買いますか？',
    });
  })
  .onIntentRequest(async responseHelper => {
    const intent = responseHelper.getIntentName();
    const userId = responseHelper.getUser().userId;
    
    switch (intent) {
      case 'ReminderIntent':
        const target = responseHelper.getSlot("target");
        
        //LINEプッシュ通知
        client.pushMessage(userId, {
          type: 'text',
          text: target + '買う'
        });

        //音声のレスポンス
        responseHelper.setSimpleSpeech({
          lang: 'ja',
          type: 'PlainText',
          value: target + '、ですね。' + 'わかりました',
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
const clovaMiddleware = clova.Middleware({ applicationId: "YOUR_APPLICATION_ID" }); //Extension ID	
// Use `clovaMiddleware` if you want to verify signature and applicationId.
// Please note `applicationId` is required when using this middleware.
app.post('/clova', clovaMiddleware, clovaSkillHandler);

// Or you can simply use `bodyParser.json()` to accept any request without verifying, e.g.,
//app.post('/clova', bodyParser.json(), clovaSkillHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on ${port}`));
