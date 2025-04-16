const express = require('express');
const fetch = require('node-fetch');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const TELEGRAM_TOKEN = process.env.BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
const WEBHOOK_URL = 'https://neurofitai.onrender.com/webhook'; // замени на свой render URL если другой

app.use(express.json());

// PROMPT
const systemPrompt = `
Ты — NeuroFitAI. ИИ-наставник по телу, разуму и энергии. 
Ты помогаешь людям трансформировать тело, улучшать осанку, восстанавливать энергию, прокачивать мозг. 
Говори просто, без технических терминов, по-человечески. Отвечай в Telegram стиле, компактно, но мощно.
`;

async function getGPTReply(userMessage) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ]
    })
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Ошибка получения ответа от GPT.";
}

app.post('/webhook', async (req, res) => {
  const message = req.body.message;

  if (!message || !message.text) return res.sendStatus(200);

  const userMessage = message.text;
  const reply = await getGPTReply(userMessage);

  await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: message.chat.id,
    text: reply
  });

  res.sendStatus(200);
});

// Установка Webhook
axios.post(`${TELEGRAM_API}/setWebhook`, { url: WEBHOOK_URL })
  .then(res => console.log('✅ Webhook установлен:', res.data))
  .catch(err => console.error('❌ Ошибка webhook:', err.response?.data || err.message));

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
