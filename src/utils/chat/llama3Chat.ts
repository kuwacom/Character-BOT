import { Runnable } from "@langchain/core/dist/runnables/base";
import ChatBase, { ChatOptions, MessageData, MessageHistory } from "./chatBase";

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

    constructor(runnable: Runnable, systemMessage: string, characterName: string, options: ChatOptions = {}) {
        super(runnable, systemMessage, options);
        this.characterName = characterName;
    }

    public addUserMessage(message: string, userName: string = "user") {
        this.messageHistory.push({
            role: 'user',
            message: `<${userName}>${message}`
        });
    }

    public addAssistantMessage(message: string) {
        this.messageHistory.push({
            role: 'user',
            message: `<${this.characterName}>${message}`
        });
    }

    public addUserReplyMessage(referenceMessage: string, referenceMessageAuthorName: string, message: string, userName: string = "user") {
        this.messageHistory.push({
            role: 'user',
            message: `「<${referenceMessageAuthorName}>${referenceMessage}」への返信: <${userName}>${message}`
        });
    }

    public addAssistantReplyMessage(referenceMessage: string, referenceMessageAuthorName: string, message: string) {
        this.messageHistory.push({
            role: 'user',
            message: `「<${referenceMessageAuthorName}>${referenceMessage}」への返信: <${this.characterName}>${message}`
        });
    }


    public getPrompt() {
        const promptBaseArray = this.getMessageStruct().map((messageData, index) => {
            return (
                `${LLama3InstToken.start_header_id}${messageData.role}${LLama3InstToken.end_header_id}\n`+
                `\n`+
                messageData.message + LLama3InstToken.eot_id
            )
        });

        const promptArray = [
            LLama3InstToken.begin_of_text, // プロンプト始まりのトークン
            ...promptBaseArray,
            `${LLama3InstToken.start_header_id}user${LLama3InstToken.end_header_id}\n\n<${this.characterName}>`
        ]

        return promptArray.join("")
    }

    public getReplyPrompt(referenceMessage: string, referenceMessageAuthorName: string) {
        const promptBaseArray = this.getMessageStruct().map((messageData, index) => {
            return (
                `${LLama3InstToken.start_header_id}${messageData.role}${LLama3InstToken.end_header_id}\n`+
                `\n`+
                messageData.message + LLama3InstToken.eot_id
            )
        });

        const promptArray = [
            LLama3InstToken.begin_of_text, // プロンプト始まりのトークン
            ...promptBaseArray,
            `${LLama3InstToken.start_header_id}user${LLama3InstToken.end_header_id}\n\n「<${referenceMessageAuthorName}>${referenceMessage}」への返信: <${this.characterName}>`
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
        const promptBaseArray = this.getMessageStruct().map((messageData, index) => {
            return (
                `${LLama3InstToken.start_header_id}${messageData.role}${LLama3InstToken.end_header_id}\n`+
                `\n`+
                messageData.message + LLama3InstToken.eot_id
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
        this.messageHistory.push({
            role: "user",
            message: message
        });
    }

    public addAssistantMessage(message: string) {
        this.messageHistory.push({
            role: "assistant",
            message: message
        });
    }

    public getMessageHistory() {
        return this.messageHistory;
    }

    public getMessageStruct(): MessageHistory {
        return [
            ({
                role: "system",
                message: this.systemMessage
            } as MessageData),
            ...this.messageHistory.slice(-this.maxHistory), // maxHistory 分送る
        ]
    }

    public getPrompt() {
        const promptBaseArray = this.getMessageStruct().map((messageData, index) => {
            return (
                `${LLama3InstToken.start_header_id}${messageData.role}${LLama3InstToken.end_header_id}\n`+
                `\n`+
                messageData.message + LLama3InstToken.eot_id
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
