import { Telegraf } from 'telegraf';

export class TelegrafHandler {
    private static instance: TelegrafHandler;
    private static bot: Telegraf;

    private constructor() {
        if (!process.env.TELEGRAM_BOT_API_KEY) {
            throw new Error('Telegram API key is missing!');
        }

        TelegrafHandler.bot = new Telegraf(process.env.TELEGRAM_BOT_API_KEY);
    }

    public static getInstance(): TelegrafHandler {
        if (!TelegrafHandler.instance) {
            TelegrafHandler.instance = new TelegrafHandler();
        }

        return TelegrafHandler.instance;
    }

    public getBot(): Telegraf {
        return TelegrafHandler.bot;
    }
}