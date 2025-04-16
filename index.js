const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Ответ на любое сообщение
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.toLowerCase() || '';

  if (text.includes('привет')) {
    bot.sendMessage(chatId, 'Привет! Я твой AI-ассистент NeuroFitAI. Готов помочь тебе с тренировками и энергией!');
  } else {
    bot.sendMessage(chatId, 'Задай мне вопрос по тренировкам, питанию или здоровью, и я помогу!');
  }
});

// Express-сервер для Render
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
  res.send('NeuroFitAI is running!');
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
