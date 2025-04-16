const express = require('express');
const fetch = require('node-fetch');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
const WEBHOOK_URL = 'https://neurofitai.onrender.com/webhook';

app.use(express.json());

// Установить webhook
axios.post(`${TELEGRAM_API}/setWebhook`, { url: WEBHOOK_URL })
  .then(res => console.log('✅ Webhook установлен:', res.data))
  .catch(err => console.error('❌ Ошибка установки webhook:', err?.response?.data || err.message));

// Системный промпт
const systemPrompt = `
Ты — NeuroFitAI. ИИ-наставник по телу, разуму и энергии. Ты помогаешь людям трансформировать тело, улучшать осанку, восстанавливать энергию, прокачивать уверенность и жить на максимуме.
Отвечай как в Telegram: кратко, мощно, по делу. Без сложных терминов.
`;

// Обработчик сообщений
app.post('/webhook', async (req, res) => {
  const message = req.body.message;

  if (!message || !message.text) return res.sendStatus(200);

  const userMessage = message.text;
  const reply = await getGptReply(userMessage);

  await sendMessage(message.chat.id, reply);

  res.sendStatus(200);
});

// Функция запроса к GPT
async function getGptReply(userMessage) {
  const apiUrl = 'https://api.openai.com/v1/chat/completions';

  const headers = {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  };

  const data = {
    model: 'gpt-4-1106-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ]
  };

  try {
    const response = await axios.post(apiUrl, data, { headers });
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('GPT Error:', error?.response?.data || error.message);
    return 'Ошибка получения ответа от GPT.';
  }
}

// Отправка сообщения в Telegram
async function sendMessage(chatId, text) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  });
}

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

}
