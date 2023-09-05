import { handlePrompt, processDocxFile } from './handlePrompt';
import { TelegrafHandler } from '../classes/TelegrafHandler';
import { Prompt } from '../classes/Prompt';
import { message } from 'telegraf/filters';
import { ChatState } from '../enums/ChatState';

const telegraf = TelegrafHandler.getInstance();
const prompt = Prompt.getInstance();

export const handleInput = (state: ChatState) => {
    if (state === ChatState.AnsweringPositionQuestion) {

    }

    if (state === ChatState.AnsweringDetailsQuestions) {

    }

    if (state === ChatState.AnsweringPIIQuestion) {

    }

    if (state === ChatState.SendingCampaignDraft) {
        // On sending campaign draft as text
        telegraf.getBot().on(message('text'), ctx => {

        });


    }
};
