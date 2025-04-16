const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.TELEGRAM_TOKEN;
const openaiApiKey = process.env.OPENAI_API_KEY;
const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [{ role: 'user', content: userMessage }],
      },
      {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const gptReply = response.data.choices[0].message.content;
    bot.sendMessage(chatId, gptReply);
  } catch (error) {
    console.error('Error from GPT:', error.response?.data || error.message);
    bot.sendMessage(chatId, 'Произошла ошибка, попробуй позже.');
  }
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
