export type MessageRole = "system" | "assistant" | "user" | string;
export type MessageEntry = [MessageRole, string];
export type MessageHistory = MessageEntry[];

export const llmInstToken = {
    begin_of_text: '<|begin_of_text|>',
    start_header_id: '<|start_header_id|>',
    end_header_id: '<|end_header_id|>',
    eot_id: '<|eot_id|>',
}

export type Llama3ChatOptions = {
    maxToken?: number;
    maxHistory?: number;
}

export type EasyLlama3ChatOptions = {
    systemMessage?: string;
    maxToken?: number;
    maxHistory?: number;
}

export default class Llama3Chat {
    systemMessage: string;
    messageHistory: MessageHistory = [];
    
    maxToken: number;
    maxHistory: number;

    constructor(systemMessage: string, options: Llama3ChatOptions = {}) {
        this.systemMessage = systemMessage;

        this.maxToken = options.maxToken ?? 1024; // トークンを使った制限はまだ実装不可
        this.maxHistory = options.maxHistory ?? 30; // llmに渡すメッセージ履歴の最大数
    }

    public setSystemMessage(message: string) {
        this.systemMessage = message;
    }

    public addUserMessage(message: string, userName: string = "user") {
        this.messageHistory.push([
            userName, message
        ]);
    }

    public addAssistantMessage(message: string) {
        this.messageHistory.push([
            "assistant", message
        ]);
    }

    public getMessageHistory() {
        return this.messageHistory;
    }

    public resetMessageHistory() {
        this.messageHistory = [];
    }

    public getMessageStruct(): MessageHistory {
        return [
            (["system", this.systemMessage] as MessageEntry),
            ...this.messageHistory.slice(-this.maxHistory), // maxHistory 分送る
        ]
    }

    public getPrompt() {
        const promptBaseArray = this.getMessageStruct().map((message, index) => {
            return (
                `${llmInstToken.start_header_id}${message[0]}${llmInstToken.end_header_id}\n`+
                `\n`+
                message[1] + llmInstToken.eot_id
            )
        });

        const promptArray = [
            llmInstToken.begin_of_text, // プロンプト始まりのトークン
            ...promptBaseArray,
            `${llmInstToken.start_header_id}assistant${llmInstToken.end_header_id}`
        ]

        return promptArray.join("")
    }
}

export class EasyLlama3Chat {
    systemMessage: string;
    messageHistory: MessageHistory = [];
    assistantName: string;
    userName: string;
    
    maxToken: number;
    maxHistory: number;

    constructor(assistantName: string, userName: string, options: EasyLlama3ChatOptions = {}) {
        this.assistantName = assistantName;
        this.userName = userName;
        this.systemMessage = options.systemMessage ??
        `あなたの名前は ${assistantName} です。\n`+
        `あなたはユーザーからの質問を回答する親切なチャットAIアシスタントです。\n`+
        `あなたは今、${userName} という名前のユーザーとチャットをしています。\n`+
        "発言は完結に短く人間のように返信してください。";

        this.maxToken = options.maxToken ?? 1024; // トークンを使った制限はまだ実装不可
        this.maxHistory = options.maxHistory ?? 30; // llmに渡すメッセージ履歴の最大数
    }

    public setSystemMessage(message: string) {
        this.systemMessage = message;
    }

    public addUserMessage(message: string) {
        this.messageHistory.push([
            "user", message
        ]);
    }

    public addAssistantMessage(message: string) {
        this.messageHistory.push([
            "assistant", message
        ]);
    }

    public getMessageHistory() {
        return this.messageHistory;
    }

    public getMessageStruct(): MessageHistory {
        return [
            (["system", this.systemMessage] as MessageEntry),
            ...this.messageHistory.slice(-this.maxHistory), // maxHistory 分送る
        ]
    }

    public getPrompt() {
        const promptBaseArray = this.getMessageStruct().map((message, index) => {
            if (message[0] == "system") {
                return (
                    `${llmInstToken.start_header_id}system${llmInstToken.end_header_id}\n`+
                    message[1] + llmInstToken.eot_id
                )
            } else if (message[0] == "assistant") {
                return (
                    `${llmInstToken.start_header_id}assistant${llmInstToken.end_header_id}\n`+
                    message[1] + llmInstToken.eot_id
                )
            } else if (message[0] == "user") {
                return (
                    `${llmInstToken.start_header_id}user${llmInstToken.end_header_id}\n`+
                    message[1] + llmInstToken.eot_id
                )
            } 
        });

        const promptArray = [
            llmInstToken.begin_of_text, // プロンプト始まりのトークン
            ...promptBaseArray,
            `${llmInstToken.start_header_id}assistant${llmInstToken.end_header_id}`
        ]

        return promptArray.join("\n")
    }
}
