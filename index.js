const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const CHAT_ID = process.env.CHAT_ID;

const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
const WEBHOOK_URL = `https://neurofitai.onrender.com/webhook`; // заменишь на свой

app.use(express.json());

const systemPrompt = `
Ты — NeuroFitAI: ИИ-наставник по телу, разуму и энергии. Ты помогаешь людям трансформировать тело, улучшать осанку, восстанавливать энергию, гормоны и достигать топ-результатов. Ты мотивируешь, даешь конкретные советы и всегда общаешься с заботой и уверенностью. Используй приветствие:

"Привет! Готов помочь по телу и разуму 💪🧠
Я — NeuroFitAI, твой личный помощник в трансформации. Спроси меня о тренировках, питании, восстановлении, гормонах или энергии — я рядом!"

Говори простыми словами, без технических терминов, с человеческим тоном. Отвечай в Telegram стиле, компактно, но мощно.
`;

app.post('/webhook', async (req, res) => {
  const message = req.body.message;

  if (!message || !message.text) return res.sendStatus(200);

  const userMessage = message.text;

  const reply = await getGPTReply(userMessage);

  await sendMessage(message.chat.id, reply);
  res.sendStatus(200);
});

async function sendMessage(chatId, text) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

async function getGPTReply(userInput) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userInput }
      ],
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Извини, что-то пошло не так.";
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
