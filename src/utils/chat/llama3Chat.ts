import ChatBase, { ChatOptions } from "./chatBase";

export type MessageRole = "system" | "assistant" | "user" | string;
export type MessageEntry = [MessageRole, string];
export type MessageHistory = MessageEntry[];

export const LLama3InstToken = {
    begin_of_text: '<|begin_of_text|>',
    start_header_id: '<|start_header_id|>',
    end_header_id: '<|end_header_id|>',
    eot_id: '<|eot_id|>',
}

export type EasyLlama3ChatOptions = {
    systemMessage?: string;
    maxToken?: number;
    maxHistory?: number;
}

/**
 * メッセージ履歴と制御トークンを利用した制御プロンプトを含んだllama3用Chatシステムクラス
 * 
 * 複数ユーザーがいるチャットへ、キャラクターとしての適応を目指したバージョン
 * 
 * @param systemMessage - LLMのSystemトークン内のプロンプト
 * @param characterName - キャラクターの名前(AIの名前)
 * @param options - LLMの設定 chatBase.ChatOptions を参照
 */
export class Llama3CharacterMultiUserChat extends ChatBase {
    characterName: string;

    constructor(systemMessage: string, characterName: string, options: ChatOptions = {}) {
        super(systemMessage, options);
        this.characterName = characterName;
    }

    public addUserMessage(message: string, userName: string = "user") {
        this.messageHistory.push([
            'user', `<${userName}>${message}`
        ]);
    }

    public addAssistantMessage(message: string) {
        this.messageHistory.push([
            'user', `<${this.characterName}>${message}`
        ]);
    }

    public getPrompt() {
        const promptBaseArray = this.getMessageStruct().map((message, index) => {
            return (
                `${LLama3InstToken.start_header_id}${message[0]}${LLama3InstToken.end_header_id}\n`+
                `\n`+
                message[1] + LLama3InstToken.eot_id
            )
        });

        const promptArray = [
            LLama3InstToken.begin_of_text, // プロンプト始まりのトークン
            ...promptBaseArray,
            `${LLama3InstToken.start_header_id}user${LLama3InstToken.end_header_id}\n\n<${this.characterName}>`
        ]

        return promptArray.join("")
    }
}

/**
 * メッセージ履歴と制御トークンを利用した制御プロンプトを含んだllama3用Chatシステムクラス
 * 
 * 単一ユーザーとの対話形式を目指したバージョン
 * 
 * @param systemMessage - LLMのSystemトークン内のプロンプト
 * @param assistantName - 
 * @param options - LLMの設定 chatBase.ChatOptions を参照
 */
export default class Llama3Chat extends ChatBase {

    public getPrompt() {
        const promptBaseArray = this.getMessageStruct().map((message, index) => {
            return (
                `${LLama3InstToken.start_header_id}${message[0]}${LLama3InstToken.end_header_id}\n`+
                `\n`+
                message[1] + LLama3InstToken.eot_id
            )
        });

        const promptArray = [
            LLama3InstToken.begin_of_text, // プロンプト始まりのトークン
            ...promptBaseArray,
            `${LLama3InstToken.start_header_id}assistant${LLama3InstToken.end_header_id}`
        ]

        return promptArray.join("")
    }
}


/**
 * 非推奨 Chat古いクラス
 * プロンプトの設定が付属している
 * 
 * @param assistantName - AIのアシスタント名の設定
 * @param userName - チャットするユーザーの名前
 * @param options - LLMの設定 EasyLlama3ChatOptions を参照
 */
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
                    `${LLama3InstToken.start_header_id}system${LLama3InstToken.end_header_id}\n`+
                    message[1] + LLama3InstToken.eot_id
                )
            } else if (message[0] == "assistant") {
                return (
                    `${LLama3InstToken.start_header_id}assistant${LLama3InstToken.end_header_id}\n`+
                    message[1] + LLama3InstToken.eot_id
                )
            } else if (message[0] == "user") {
                return (
                    `${LLama3InstToken.start_header_id}user${LLama3InstToken.end_header_id}\n`+
                    message[1] + LLama3InstToken.eot_id
                )
            } 
        });

        const promptArray = [
            LLama3InstToken.begin_of_text, // プロンプト始まりのトークン
            ...promptBaseArray,
            `${LLama3InstToken.start_header_id}assistant${LLama3InstToken.end_header_id}`
        ]

        return promptArray.join("\n")
    }
}
