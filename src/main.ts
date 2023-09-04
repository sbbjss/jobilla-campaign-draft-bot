import * as dotenv from 'dotenv';
import OpenAI from 'openai';
import { Telegraf, Markup } from 'telegraf';
import { message } from "telegraf/filters";
import { Message } from './enums/Message';
import { ButtonLabel } from './enums/ButtonLabel';

dotenv.config();

// This is used to preserve context for chatGPT API. Should be replaced in a better way than code variable 
const messagesHistory = [] as any[];

const declutterMessagesHistory = function() {
    if (messagesHistory.length > 6) {
        messagesHistory.shift();
    }
}

const bot = new Telegraf(process.env.TELEGRAM_BOT_API_KEY as string);
const openAI = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

bot.start((ctx) => ctx.reply(
    Message.Welcome,
    Markup.keyboard([ButtonLabel.GetStarted]).resize(),
));

bot.hears(ButtonLabel.GetStarted, (ctx) => {
    ctx.reply(
        Message.ChoosePII,
        Markup.keyboard([ButtonLabel.NoPIISent, ButtonLabel.PIIConsent]).resize(),
    )
});

bot.on(message('text'),  async (ctx) => {
    const message = ctx.update.message.text;
    messagesHistory.push({ role: 'user', content: message });
  //declutterMessagesHistory();

    console.log(messagesHistory);

    try {
        ctx.sendChatAction('typing');
        const response = await openAI.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: messagesHistory,
          max_tokens: 2000,
          temperature: 0.5,
          stream: false,
        });
    
        messagesHistory.push(response.choices[0].message);
        //declutterMessagesHistory();
        ctx.reply(response.choices[0].message?.content as string);
      } catch (err) {
        console.log('ChatGPT error: ' + err);
      }
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))