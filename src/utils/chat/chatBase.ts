export type ChatOptions = {
    maxToken?: number;
    maxHistory?: number;
}

export type MessageRole = "system" | "assistant" | "user" | string;
export type MessageEntry = [MessageRole, string];
export type MessageHistory = MessageEntry[];

/**
 * メッセージ履歴を含んだChatシステムのベース抽象化クラス
 * 
 * @param systemMessage - LLMのSystemトークン内のプロンプト
 * @param options - LLMの設定 chatBase.ChatOptions を参照
 */
export default abstract class ChatBase {
    systemMessage: string;
    messageHistory: MessageHistory = [];

    maxToken: number;
    maxHistory: number;

    constructor(systemMessage: string, options: ChatOptions = {}) {
        this.systemMessage = systemMessage;
    
        this.maxToken = options.maxToken ?? 1024; // トークンを使った制限はまだ実装不可
        this.maxHistory = options.maxHistory ?? 30; // llmに渡すメッセージ履歴の最大数
    }

    public setSystemMessage(message: string) {
        this.systemMessage = message;
    }

    public addUserMessage(message: string) {
        this.messageHistory.push(['user', message]);
    }

    public addAssistantMessage(message: string) {
        this.messageHistory.push(['assistant', message]);
    }

    public getMessageHistory() {
        return this.messageHistory;
    }

    public resetMessageHistory() {
        this.messageHistory = [];
    }

    public getMessageStruct(): MessageHistory {
        return [
            (['system', this.systemMessage] as MessageEntry),
            ...this.messageHistory.slice(-this.maxHistory), // maxHistory 分送る
        ];
    }

    abstract getPrompt(): string;
}
