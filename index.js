const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

app.use(express.json());

// Обработка запроса от Telegram
app.post(`/webhook/${TOKEN}`, async (req, res) => {
  const message = req.body?.message;

  if (message) {
    const chatId = message.chat.id;
    const text = message.text?.toLowerCase() || '';

    let reply = 'Я не понял, но я уже учусь 😉';

    if (text.includes('привет')) reply = 'Привет! Готов помочь по телу и разуму 💪🧠';
    if (text.includes('тренировка')) reply = 'Хочешь жиросжигающую или силовую?';

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: reply
    });
  }

  return res.sendStatus(200);
});

app.get('/', (req, res) => {
  res.send('NeuroFitAI Webhook Bot запущен 🚀');
});

app.listen(PORT, async () => {
  console.log(`✅ Server running on port ${PORT}`);

  // Установить Webhook при запуске
  const WEBHOOK_URL = `${process.env.RENDER_EXTERNAL_URL}/webhook/${TOKEN}`;
  try {
    await axios.get(`${TELEGRAM_API}/deleteWebhook`);
    await axios.post(`${TELEGRAM_API}/setWebhook`, {
      url: WEBHOOK_URL
    });
    console.log('🔗 Webhook успешно установлен:', WEBHOOK_URL);
  } catch (error) {
    console.error('Ошибка при установке webhook:', error?.response?.data || error);
  }
});
