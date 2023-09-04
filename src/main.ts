import * as dotenv from 'dotenv';
import OpenAI from 'openai';
import axios from 'axios';
import { createDocumentParser } from '@arbs.io/asset-extractor-wasm';
import { Context, Markup, Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { Message } from './enums/Message';
import { ButtonLabel } from './enums/ButtonLabel';
import { ChatCompletionMessageParam } from 'openai/src/resources/chat/completions';
import { parseOffice } from 'officeparser';

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_API_KEY as string);
const openAI = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


// This is used to preserve context for chatGPT API. Should be replaced in a better way than code variable 
const messagesHistory: Array<ChatCompletionMessageParam> = [];

const declutterMessagesHistory = () => {
    if (messagesHistory.length > 6) {
        messagesHistory.shift();
    }
};

const messageMapAndJoin = (messages: ChatCompletionMessageParam[]): string => {
    return messages.map(msg => msg.content).join(' ');
};

const sendPromptToOpenAI = async (ctx: Context, input: string) => {
    ctx.sendChatAction('typing');

    const response = await openAI.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: input }],
        max_tokens: 2000,
        temperature: 0.5,
        stream: false,
    });

    return response.choices[0].message?.content as string;
};

const sendAndProcessPrompt = async (ctx: Context, userInput: string) => {
    try {
        messagesHistory.push({ role: 'user', content: userInput });
        const gptResponse = await sendPromptToOpenAI(ctx, messageMapAndJoin(messagesHistory));
        declutterMessagesHistory();
        ctx.reply(gptResponse);
    } catch ( err ) {
        ctx.reply(
            Message.SomethingWentWrong,
            Markup.keyboard([ButtonLabel.GetStarted]).resize(),
        );
    }
}

const processDocxFile = async (ctx: Context) => {
    // @ts-ignore
    const mimeType = ctx?.message?.document.mime_type;

    // Check if the uploaded document is of type txt, docx, or pdf
    if (!mimeType || mimeType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        ctx.reply(
            Message.IncorrectFile,
            Markup.keyboard([ButtonLabel.GetStarted]).resize(),
        );

        return;
    }

    ctx.reply(Message.FileSuccess, Markup.removeKeyboard());

    // @ts-ignore
    const fileLink = await ctx.telegram.getFileLink(ctx.message.document.file_id);
    const response = await axios.get(fileLink.toString(), { responseType: 'arraybuffer' });

    if (!response.data) {
        ctx.reply(
            Message.SomethingWentWrong,
            Markup.keyboard([ButtonLabel.GetStarted]).resize(),
        );

        return;
    }

    return createDocumentParser(new Uint8Array(response.data))?.contents?.text;
}

// Greets user
bot.start((ctx) => ctx.reply(
    Message.Welcome,
    Markup.keyboard([ButtonLabel.GetStarted]).resize(),
));

// User selects way to handle PII
bot.hears(ButtonLabel.GetStarted, (ctx) => {
    ctx.reply(
        Message.ChoosePII,
        Markup.keyboard([ButtonLabel.NoPIISent, ButtonLabel.PIIConsent]).resize(),
    );
});

<<<<<<< HEAD
bot.on(message('text'),  async (ctx) => {
    const message = ctx.update.message.text;
    messagesHistory.push({ role: 'user', content: message });
  declutterMessagesHistory();
=======
// User opts out of sending PII and uploads campaign draft
bot.hears(ButtonLabel.NoPIISent, async ctx => {
    ctx.reply(Message.SendCampaignDraft, Markup.removeKeyboard());
});
>>>>>>> df7a32b3d5a387d77c2402fc63d72c681f7cedb6

// On sending campaign draft as text
bot.on(message('text'), async ctx => {
    const userInput = ctx.update.message.text;
<<<<<<< HEAD
    messagesHistory.push({ role: 'user', content: userInput });

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
        declutterMessagesHistory();
        ctx.reply(response.choices[0].message?.content as string);
      } catch (err) {
        console.log('ChatGPT error: ' + err);
    }
=======
    sendAndProcessPrompt(ctx, userInput);
>>>>>>> df7a32b3d5a387d77c2402fc63d72c681f7cedb6
});

// On sending campaign draft as docx
bot.on(message('document'), async ctx => {
    const userInput = await processDocxFile(ctx);

    if (userInput == null) {
        ctx.reply(
            Message.SomethingWentWrong,
            Markup.keyboard([ButtonLabel.GetStarted]).resize(),
        );

        return;
    }

    sendAndProcessPrompt(ctx, userInput);
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));