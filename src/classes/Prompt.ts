import { OpenAIHandler } from './OpenAIHandler';

export class Prompt {
    private static instance: Prompt;

    private constructor() {}

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
    private position: string = '';
    private typesOfQuestions: string = '';

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
            return `[$${safeVariableName}=UNKNOWN]`;
        });
    }

    private preventTokenOverflow() {
        if (this.promptChain.length > 5000) {
            this.promptChain = this.promptChain.slice(this.promptChain.length - 5000);
        }
    }

    setPrompt(prompt: string) {
        this.userPrompt = prompt;
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

    public clearPrompt(): void {
        this.position = '';
        this.typesOfQuestions = '';
        this.promptChain = '';
        this.userPrompt = '';
        this.gptResponse = '';
    }

    async sendPrompt() {
        // Cut prompt chain if it is about to overflow
        this.preventTokenOverflow();

        // Add user prompt to prompt chain
        this.promptChain = this.promptChain + ' \n' + `User: ${this.userPrompt}`;

        // Strip sensitive data from prompt chain
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
        this.promptChain = this.promptChain + '\n ' + `ChatGPT: ${this.gptResponse}`;
    }

    get fullPrompt(): string {
        return this.promptInstructions + '\n ' + this.promptChain;
    }

    get response(): string {
        return this.gptResponse;
    }

    get promptInstructions(): string {
        return `Create exactly 8 application questions
        numbered from 1 to 8 for ${this.position} applicant. 
        Each question should be with 4 answer options. 
        Include questions about ${this.typesOfQuestions}. 
        Campaign draft will be included after the instructions. 
        If you encounter variables in square brackets, you can use them in questions as well.`;
    }
}