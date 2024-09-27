import { Runnable } from "@langchain/core/dist/runnables/base";
import ChatBase, { ChatOptions, MessageData, MessageHistory } from "./chatBase";

/**
 * 制御構造令
<bos><start_of_turn>user
Write a hello world program<end_of_turn>
<start_of_turn>model
 */

export const Gemma2InstToken = {
    bos: '<bos>',
    start_of_turn: '<start_of_turn>',
    end_of_turn: '<end_of_turn>',
    eos: '<eos>',
}

/**
 * メッセージ履歴と制御トークンを利用した制御プロンプトを含んだGemma2用Chatシステムクラス
 * 
 * 複数ユーザーがいるチャットへ、キャラクターとしての適応を目指したバージョン
 * 
 * @param systemMessage - LLMのSystemトークン内のプロンプト
 * @param characterName - キャラクターの名前(AIの名前)
 * @param options - LLMの設定 chatBase.ChatOptions を参照
 */
export class Gemma2CharacterMultiUserChat extends ChatBase {
    characterName: string;

    constructor(runnable: Runnable, systemMessage: string, characterName: string, options: ChatOptions = {}) {
        super(runnable, systemMessage, options);
        this.characterName = characterName;
    }

    public addUserMessage(message: string, userName: string = "user") {
        this.messageHistory.push({
            role: 'user',
            message: `${userName}: ${message}`
        });
    }

    public addAssistantMessage(message: string) {
        this.messageHistory.push({
            role: 'model',
            message: `${this.characterName}: ${message}`
        });
    }

    public addUserReplyMessage(referenceMessage: string, referenceMessageAuthorName: string, message: string, userName: string = "user") {
        this.messageHistory.push({
            role: 'user',
            message: `「${referenceMessageAuthorName}: ${referenceMessage}」への返信 - ${userName}: ${message}`
        });
    }

    public addAssistantReplyMessage(referenceMessage: string, referenceMessageAuthorName: string, message: string) {
        this.messageHistory.push({
            role: 'model',
            message: `「${referenceMessageAuthorName}: ${referenceMessage}」への返信 - ${this.characterName}: ${message}`
        });
    }


    public getPrompt() {
        const promptBaseArray = this.getMessageStruct().map((messageData, index) => {
            return (
                `${Gemma2InstToken.start_of_turn}${messageData.role}\n`+
                `${messageData.message}${Gemma2InstToken.end_of_turn}\n`
            )
        });

        const promptArray = [
            Gemma2InstToken.bos, // プロンプト始まりのトークン
            ...promptBaseArray,
            `${Gemma2InstToken.start_of_turn}model\n${this.characterName}: `
        ]

        return promptArray.join("")
    }

    public getReplyPrompt(referenceMessage: string, referenceMessageAuthorName: string) {
        const promptBaseArray = this.getMessageStruct().map((messageData, index) => {
            return (
                `${Gemma2InstToken.start_of_turn}${messageData.role}\n`+
                `${messageData.message}${Gemma2InstToken.end_of_turn}\n`
            )
        });

        const promptArray = [
            Gemma2InstToken.bos, // プロンプト始まりのトークン
            ...promptBaseArray,
            `${Gemma2InstToken.start_of_turn}model\n`,
            `「${referenceMessageAuthorName}: ${referenceMessage}」への返信 - ${this.characterName}: `
        ]

        return promptArray.join("")
    }
}

/**
 * メッセージ履歴と制御トークンを利用した制御プロンプトを含んだGemma2用Chatシステムクラス
 * 
 * 単一ユーザーとの対話形式を目指したバージョン
 * 
 * @param systemMessage - LLMのSystemトークン内のプロンプト
 * @param assistantName - 
 * @param options - LLMの設定 chatBase.ChatOptions を参照
 */
export default class Gemma2Chat extends ChatBase {

    public addAssistantMessage(message: string) {
        this.messageHistory.push({
            role: 'model',
            message: message
        });
    }

    public getPrompt() {
        const promptBaseArray = this.getMessageStruct().map((messageData, index) => {
            return (
                `${Gemma2InstToken.start_of_turn}${messageData.role}\n`+
                `${messageData.message}${Gemma2InstToken.end_of_turn}\n`
            )
        });

        const promptArray = [
            Gemma2InstToken.bos, // プロンプト始まりのトークン
            ...promptBaseArray,
            `${Gemma2InstToken.start_of_turn}model\n`
        ]

        return promptArray.join("")
    }
}