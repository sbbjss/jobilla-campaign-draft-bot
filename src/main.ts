import { Markup } from 'telegraf';
import { Message } from './enums/Message';
import { ButtonLabel } from './enums/ButtonLabel';
import { TelegrafHandler } from './classes/TelegrafHandler';
import { Prompt } from './classes/Prompt';
import { message } from 'telegraf/filters';
import { handlePrompt, processDocxFile } from './handlers/handlePrompt';
import { ChatState } from './enums/ChatState';

const telegraf = TelegrafHandler.getInstance();
const prompt = Prompt.getInstance();

let state = ChatState.AnsweringPositionQuestion;

// Greets user
telegraf.getBot().start(ctx => ctx.reply(
    Message.Welcome,
    Markup.keyboard([ButtonLabel.GetStarted]).resize(),
));

// User is asked position question
telegraf.getBot().hears([ButtonLabel.GetStarted, ButtonLabel.StartOver], ctx => {
    state = ChatState.AnsweringPositionQuestion;
    prompt.clearPrompt();

    ctx.reply(
        Message.AskRole,
        Markup.keyboard([ButtonLabel.StartOver]).resize(),
    );
});

// User opts out of sending PII and uploads campaign draft
telegraf.getBot().hears(ButtonLabel.NoPIISent, ctx => {
    state = ChatState.SendingCampaignDraft;

    ctx.reply(
        Message.SendCampaignDraft,
        Markup.keyboard([ButtonLabel.StartOver]).resize()
    );
});

// User agrees to let Jobilla Bot process PII and receives instructions
telegraf.getBot().hears(ButtonLabel.PIIConsent, ctx => {
    ctx.reply(
        Message.PIIInstructions,
        Markup.keyboard([ButtonLabel.Ready, ButtonLabel.StartOver]).resize(),
    );

});

// Proceeds user to send campaign draft
telegraf.getBot().hears(ButtonLabel.Ready, ctx => {
    state = ChatState.SendingCampaignDraft;

    ctx.reply(
        Message.SendCampaignDraft,
        Markup.keyboard([ButtonLabel.StartOver]).resize()
    );
});

telegraf.getBot().on(message('text'), ctx => {
    switch (state) {
        case ChatState.AnsweringPositionQuestion: {
            prompt.setPosition(ctx.update.message.text);

            ctx.reply(
                Message.AskDetails,
                Markup.keyboard([ButtonLabel.StartOver]).resize(),
            );

            state = ChatState.AnsweringDetailsQuestions;

            return;
        }
        case ChatState.AnsweringDetailsQuestions: {
            prompt.setTypesOfQuestions(ctx.update.message.text);

            ctx.reply(
                Message.ChoosePIIMethod,
                Markup.keyboard([ButtonLabel.NoPIISent, ButtonLabel.PIIConsent]).resize(),
            );

            return;
        }
        case ChatState.SendingCampaignDraft: {
            prompt.setPrompt(ctx.update.message.text);

            handlePrompt(ctx);
            return;
        }
    }
});

telegraf.getBot().on(message('document'), async ctx => {
    if (state !== ChatState.SendingCampaignDraft) {
        return;
    }

    const parsedFile: string = await processDocxFile(ctx) ?? '';

    prompt.setPrompt(parsedFile);
    handlePrompt(ctx);

    return;
});

telegraf.getBot().launch();

// Enable graceful stop
process.once('SIGINT', () => telegraf.getBot().stop('SIGINT'));
process.once('SIGTERM', () => telegraf.getBot().stop('SIGTERM'));