import { Telegraf } from 'telegraf';
import { message } from "telegraf/filters";
import * as dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_API_KEY as string);
const openAI = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

bot.start((ctx) => ctx.reply('Welcome dear Jobillian! This tool is created to help you create a campaign draft easily. All sensitive data about customer and recruitment are not shared with OpenAI and not stored anywhere'));
bot.help((ctx) => ctx.reply('Send me a sticker'));
bot.on(message('text'),  async (ctx) => {
    const message = ctx.update.message.text;

    try {
        const response = await openAI.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: 'user', content: message }],
          max_tokens: 2000,
          temperature: 0.5,
          stream: false,
        });
    
        console.log(
          'Full response: ', response,
          'Choices: ', ...response.choices
        );
        console.log(response.choices[0].message?.content);
        ctx.reply(response.choices[0].message?.content as string);
      } catch (err) {
        console.log('ChatGPT error: ' + err);
      }
});
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))