import * as dotenv from 'dotenv';
import { Markup } from 'telegraf';
import { message } from 'telegraf/filters';
import { Message } from './enums/Message';
import { ButtonLabel } from './enums/ButtonLabel';
import { TelegrafHandler } from './classes/TelegrafHandler';
import { Prompt } from './classes/Prompt';
import { handlePrompt, processDocxFile } from './handlePrompt';

dotenv.config();

const telegraf = TelegrafHandler.getInstance();
const prompt = Prompt.getInstance();


// Greets user
telegraf.getBot().start((ctx) => ctx.reply(
    Message.Welcome,
    Markup.keyboard([ButtonLabel.GetStarted]).resize(),
));

// User selects way to handle PII
telegraf.getBot().hears([ButtonLabel.GetStarted, ButtonLabel.StartOver], (ctx) => {
    ctx.reply(
        Message.ChoosePIIMethod,
        Markup.keyboard([ButtonLabel.NoPIISent, ButtonLabel.PIIConsent]).resize(),
    );
});

// User opts out of sending PII and uploads campaign draft
telegraf.getBot().hears(ButtonLabel.NoPIISent, async ctx => {
    ctx.reply(Message.SendCampaignDraft, Markup.removeKeyboard());
});

// User agrees to let Jobilla Bot process PII and receives instructions
telegraf.getBot().hears(ButtonLabel.PIIConsent, async ctx => {
    ctx.reply(
        Message.PIIInstructions,
        Markup.keyboard([ButtonLabel.Ready, ButtonLabel.StartOver]).resize(),
    );

    // Proceeds user to send campaign draft
    telegraf.getBot().hears(ButtonLabel.Ready, async ctx => {
        ctx.reply(Message.SendCampaignDraft, Markup.removeKeyboard());
    });
});

// On sending campaign draft as text
telegraf.getBot().on(message('text'), async ctx => {
    prompt.setPrompt(ctx.update.message.text);
    handlePrompt(ctx);
});

// On sending campaign draft as docx
telegraf.getBot().on(message('document'), async ctx => {
    prompt.setPrompt(await processDocxFile(ctx) ?? '');
    handlePrompt(ctx);
});

telegraf.getBot().launch();

// Enable graceful stop
process.once('SIGINT', () => telegraf.getBot().stop('SIGINT'));
process.once('SIGTERM', () => telegraf.getBot().stop('SIGTERM'));