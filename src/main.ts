import * as dotenv from 'dotenv';
import OpenAI from 'openai';
import axios from 'axios';
import { createDocumentParser } from '@arbs.io/asset-extractor-wasm';
import { Context, Markup, Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
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

const sendPromptToOpenAI = async (ctx: Context, userInput: string) => {
    ctx.sendChatAction('typing');
    const response = await openAI.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: userInput }],
        max_tokens: 2000,
        temperature: 0.5,
        stream: false,
    });

    return response.choices[0].message?.content as string;
};

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

// User opts out of sending PII and uploads campaign draft
bot.hears(ButtonLabel.NoPIISent, async (ctx) => {
    ctx.reply(Message.SendCampaignDraft, Markup.removeKeyboard());
});

// On sending campaign draft as text
bot.on(message('text'), async ctx => {
    const userInput = ctx.update.message.text;
    messagesHistory.push({ role: 'user', content: userInput });

    try {
        const gptResponse = await sendPromptToOpenAI(ctx, userInput);
        messagesHistory.push(gptResponse);
        declutterMessagesHistory();
        ctx.reply(gptResponse);
    } catch ( err ) {
        console.log('ChatGPT error: ' + err);
    }
});

// On sending campaign draft as docx
bot.on(message('document'), async ctx => {
    const mimeType = ctx.message.document.mime_type;

    // Check if the uploaded document is of type txt, docx, or pdf
    if (!mimeType || mimeType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        ctx.reply(
            Message.IncorrectFile,
            Markup.keyboard([ButtonLabel.GetStarted]).resize(),
        );

        return;
    }

    ctx.reply(Message.FileSuccess, Markup.removeKeyboard());

    const fileLink = await ctx.telegram.getFileLink(ctx.message.document.file_id);
    const response = await axios.get(fileLink.toString());

    if (!response?.data) {
        ctx.reply(
            Message.SomethingWentWrong,
            Markup.keyboard([ButtonLabel.GetStarted]).resize(),
        );

        return;
    }

    const userInput = createDocumentParser(new Uint8Array(response.data))?.contents?.text;

    if (userInput == null) {
        ctx.reply(
            Message.SomethingWentWrong,
            Markup.keyboard([ButtonLabel.GetStarted]).resize(),
        );

        return;
    }

    messagesHistory.push({ role: 'user', content: userInput });

    try {
        const gptResponse = await sendPromptToOpenAI(ctx, userInput);
        ctx.reply(gptResponse);
    } catch ( err ) {
        console.log('ChatGPT error: ' + err);
    }
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));