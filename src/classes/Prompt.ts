import { ChatCompletionMessageParam } from 'openai/src/resources/chat/completions';
import { OpenAIHandler } from './OpenAIHandler';

export class Prompt {
    private static instance: Prompt;

    private constructor() {
        this.promptChain = this.promptBriefing;
    }

    public static getInstance(): Prompt {
        if (!Prompt.instance) {
            Prompt.instance = new Prompt();
        }

        return Prompt.instance;
    }

    private protectedVariables: string[][] = [];

    private gptResponse: string = '';
    private promptChain: string = '';
    private userPrompt: string = '';
    private applicationCount: number = 8;
    private multipleChoiceQuestions: number = 4;
    private choiceCount: number = 4;
    private position: string = 'software developer';
    private typesOfQuestions: string = 'technical skills, soft skills, and motivation';

    private openAI = OpenAIHandler.getInstance();

    private setVariables(variables: string[][]) {
        this.protectedVariables = variables;
    }

    public stripAndStorePIIFromPrompt() {
        const regex = /\[\$(\w+?)=(.+?)\]/g;

        let match: RegExpMatchArray | null;
        const variablesWithValues: string[][] = [];

        while ((match = regex.exec(this.promptChain)) !== null) {
            const safeVariableName = match[1];
            const PIIValue = match[2];
            variablesWithValues.push([safeVariableName, PIIValue]);
        }

        this.setVariables(variablesWithValues);

        // Strip PII values from this.userPrompt
        this.userPrompt = this.userPrompt.replace(regex, (match, safeVariableName) => {
            return `[$${safeVariableName}=REDACTED]`;
        });
    }

    private preventTokenOverflow() {
        if (this.promptChain.length > 5000) {
            this.promptChain = this.promptChain.slice(this.promptChain.length - 5000);
        }
    }

    appendToPromptChain(promptChain: Array<ChatCompletionMessageParam>) {
        this.promptChain = this.promptChain += promptChain.map(msg => msg.content).join(' ');
    }

    setPrompt(prompt: string) {
        this.userPrompt = prompt;
    }

    setApplicationCount(value: number) {
        this.applicationCount = value;
    }

    setMultipleChoiceQuestions(value: number) {
        this.multipleChoiceQuestions = value;
    }

    setChoiceCount(value: number) {
        this.choiceCount = value;
    }

    setPosition(value: string) {
        this.position = value;
    }

    setTypesOfQuestions(value: string) {
        this.typesOfQuestions = value;
    }

    private restorePIIForResponse() {
        if (this.protectedVariables.length > 0) {
            this.protectedVariables.forEach(variable => {
                const regex = new RegExp(`\\[\\$${variable[0]}=(.+?)\\]`, 'g');
                this.gptResponse = this.gptResponse.replace(regex, variable[1]);
            });
        }
    }

    async sendPrompt() {
        this.preventTokenOverflow();
        this.stripAndStorePIIFromPrompt();

        const response = await this.openAI.getApi().chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: this.fullPrompt }],
            max_tokens: 2000,
            temperature: 0.5,
            stream: false,
        });

        this.gptResponse = response.choices[0].message?.content ?? '';

        if (!this.gptResponse) {
            return;
        }

        this.restorePIIForResponse();
        this.promptChain = this.promptChain + ' ' + this.gptResponse;
    }

    get fullPrompt(): string {
        return this.promptChain;
    }

    get response(): string {
        return this.gptResponse;
    }

    get promptBriefing(): string {
        return `Create ${this.applicationCount} application questions. 
        ${this.multipleChoiceQuestions} should be with ${this.choiceCount} for ${this.position} applicant. 
        Include questions about ${this.typesOfQuestions}.
        If you encounter variables in square brackets, leave them as they are.`;
    }
}