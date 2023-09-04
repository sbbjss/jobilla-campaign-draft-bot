import { Context, Markup } from 'telegraf';
import { Message } from './enums/Message';
import { ButtonLabel } from './enums/ButtonLabel';
import { Prompt } from './classes/Prompt';
import axios from 'axios';
import { createDocumentParser } from '@arbs.io/asset-extractor-wasm';

const prompt = Prompt.getInstance();

export const processDocxFile = async (ctx: Context) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const mimeType = ctx?.message?.document.mime_type;

    // Check if the uploaded document is of type txt, docx, or pdf
    if (!mimeType || mimeType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        ctx.reply(
            Message.IncorrectFile,
            Markup.keyboard([ButtonLabel.StartOver]).resize(),
        );

        return;
    }

    ctx.reply(Message.FileSuccess, Markup.removeKeyboard());

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const fileLink = await ctx.telegram.getFileLink(ctx.message.document.file_id);
    const response = await axios.get(fileLink.toString(), { responseType: 'arraybuffer' });

    if (!response.data) {
        ctx.reply(
            Message.SomethingWentWrong,
            Markup.keyboard([ButtonLabel.StartOver]).resize(),
        );

        return;
    }

    return createDocumentParser(new Uint8Array(response.data))?.contents?.text;
};

export const handlePrompt = async (ctx: Context) => {
    try {
        ctx.sendChatAction('typing');
        prompt.sendPrompt();
        ctx.reply(prompt.response);
    } catch ( err ) {
        ctx.reply(
            Message.SomethingWentWrong,
            Markup.keyboard([ButtonLabel.StartOver]).resize(),
        );
    }
};