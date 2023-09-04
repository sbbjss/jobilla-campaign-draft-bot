import { Telegraf } from 'telegraf';
import { message } from "telegraf/filters";
import * as dotenv from 'dotenv';
import OpenAI from "openai";

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_API_KEY);
const openAI = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// bot.start('start', (ctx) => {
//     ctx.reply('Welcome dear Jobillian! This tool is created to help you create a campaign draft easily.');
//     ctx.reply('All sensitive data about customer and recruitment are not shared with OpenAI and not stored anywhere');
// });

bot.start((ctx) => ctx.reply('Welcome dear Jobillian! This tool is created to help you create a campaign draft easily. All sensitive data about customer and recruitment are not shared with OpenAI and not stored anywhere'));
bot.help((ctx) => ctx.reply('Send me a sticker'));
bot.on(message('text'), (ctx) => ctx.reply('I\'m still in the works!'));