import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

export class OpenAIHandler {
    private static instance: OpenAIHandler;
    private static api: OpenAI;

    private constructor() {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key is missing!');
        }
        OpenAIHandler.api = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    public static getInstance(): OpenAIHandler {
        if (!OpenAIHandler.instance) {
            OpenAIHandler.instance = new OpenAIHandler();
        }

        return OpenAIHandler.instance;
    }

    public getApi(): OpenAI {
        return OpenAIHandler.api;
    }
}
