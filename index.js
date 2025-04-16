const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const port = process.env.PORT || 3000;
const token = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.toLowerCase();

  if (text.includes('привет')) {
    bot.sendMessage(chatId, 'Привет! Готов помочь по телу и разуму 💪🧠');
  } else {
    bot.sendMessage(chatId, 'Я не понял, но я уже учусь 😉');
  }
});

app.get('/', (req, res) => {
  res.send('NeuroFitAI is working!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
