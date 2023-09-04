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
bot.on(message('text'),  (ctx) => {
    ctx.reply('Now some magic will happen, pls wait!');
    const message = ctx.update.message.text;
    ctx.reply('Your message: ' + message);
});
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))