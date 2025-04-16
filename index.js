const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const TELEGRAM_TOKEN = process.env.BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const WEBHOOK_URL = 'https://neurofitai.onrender.com/webhook';

const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

app.use(express.json());

// Установим webhook
fetch(`${TELEGRAM_API}/setWebhook`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: WEBHOOK_URL })
})
  .then(res => res.json())
  .then(data => console.log('✅ Webhook установлен:', data))
  .catch(err => console.error('❌ Ошибка установки webhook:', err.message));

const systemPrompt = `
Ты — NeuroFitAI. ИИ-наставник по телу, разуму и энергии. Ты помогаешь людям трансформировать тело, улучшать осанку, восстанавливать энергию, прокачивать мозг и становиться сильнее.
Говори просто, по делу, без терминов. Отвечай как Telegram-бот — коротко, понятно, поддерживающе.
`;

// Обработка сообщений от Telegram
app.post('/webhook', async (req, res) => {
  const message = req.body.message;

  if (!message || !message.text) return res.sendStatus(200);

  const userMessage = message.text;

  try {
    const gptReply = await getGptReply(userMessage);
    await sendMessage(message.chat.id, gptReply);
  } catch (err) {
    console.error('Ошибка при получении ответа от GPT:', err.message);
    await sendMessage(message.chat.id, 'Ошибка получения ответа от GPT.');
  }

  res.sendStatus(200);
});

// Отправка сообщения в Telegram
async function sendMessage(chatId, text) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text })
  });
}

// Получение ответа от GPT-4 Turbo
async function getGptReply(userInput) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userInput }
      ],
      max_tokens: 500,
      temperature: 0.7
    })
  });

  const data = await response.json();

  if (!data.choices || !data.choices[0]?.message?.content) {
    throw new Error('GPT не дал ответ');
  }

  return data.choices[0].message.content.trim();
}

app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
});
