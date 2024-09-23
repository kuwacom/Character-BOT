import { Runnable } from "@langchain/core/dist/runnables/base";
import { RunnableConfig } from "@langchain/core/dist/runnables/types";

export type ChatOptions = {
    maxToken?: number;
    maxHistory?: number;
}

export type MessageRole = "system" | "assistant" | "user" | string;
export type MessageData = {
    role: MessageRole;
    message: string;
};
export type MessageHistory = MessageData[];

/**
 * メッセージ履歴を含んだChatシステムのベース抽象化クラス
 * 
 * 生成部分にはLangChainを利用
 * 
 * @param systemMessage - LLMのSystemトークン内のプロンプト
 * @param options - LLMの設定 chatBase.ChatOptions を参照
 */
export default abstract class ChatBase {
    systemMessage: string;
    messageHistory: MessageHistory = [];

    maxToken: number;
    maxHistory: number;

    runnable: Runnable;
    isProcessing = false;

    constructor(runnable: Runnable, systemMessage: string, options: ChatOptions = {}) {
        this.runnable = runnable;
        this.systemMessage = systemMessage;
    
        this.maxToken = options.maxToken ?? 1024; // トークンを使った制限はまだ実装不可
        this.maxHistory = options.maxHistory ?? 30; // llmに渡すメッセージ履歴の最大数
    }
    
    /**
     * コンストラクタで定義したChainを出力
     * 
     * @returns Runnable
     */
    public getRunnable() {
        return this.runnable;
    }

    /**
     * Streamで受け取りをするのLLMの実行
     * 
     * @param inputPrompt LLMに渡すプロンプト
     * @param options LLMに渡す設定 デフォルトではTimeoutを5分に設定する
     * @returns Promise<IterableReadableStream>
     */
    public async getStream(inputPrompt: string, options: Partial<RunnableConfig> = { timeout: 300000 }) {
        return await this.runnable.stream(inputPrompt, options);
    }

    /**
     * 通常のLLM実行 生成終了まで値は帰ってこない
     * 
     * @param inputPrompt LLMに渡すプロンプト
     * @param options LLMに渡す設定 デフォルトではTimeoutを5分に設定する
     * @returns Promise<String>
     */
    public async originalInvoke(inputPrompt: string, options: Partial<RunnableConfig> = { timeout: 300000 }): Promise<string> {
        this.isProcessing = true;
        const result = await this.runnable.invoke(inputPrompt, options);
        this.isProcessing = false;
        return result;
    }

    /**
     * Streamで受け取りをするのLLMの実行
     * 結果を非同期で受け取り可能
     * 
     * 詳細なフィルターを実装可能です
     * 
     * @param inputPrompt LLMに渡すプロンプト
     * @param streamHandler streamを受け取ったときの各チャンクの処理 フィルターを実装したりする
     * @param options LLMに渡す設定 デフォルトではTimeoutを5分に設定する
     * @returns 
     */
    public async invoke(
        inputPrompt: string,
        streamHandler: (chunk: Buffer) => Buffer | undefined = (chunk: Buffer) => chunk,
        options: Partial<RunnableConfig> = { timeout: 300000 }
    ): Promise<string> {
        this.isProcessing = true;
        const stream = await this.getStream(inputPrompt, options);

        const buffer: Buffer[] = [];
        let firstTextFlag = false;
        // 取得したストリームを結合する処理
        for await (const chunk of stream) {
            const chunkData: Buffer = chunk as Buffer;
            if (chunkData.length == 0) continue; // 何もないチャンクは無視
            for (const byte of chunkData) {
                if (byte.toString() != "\n") firstTextFlag = true; // 最初になぜか\nが沢山来るのでそれらを無視する 
            }
            if (firstTextFlag == false) continue;
            
            const chunkDataResult = streamHandler(chunkData);
            if (chunkDataResult) {
                buffer.push(chunkDataResult);
            }
        }

        const result = buffer.join("").toString();
        this.isProcessing = false;
        return result;
    }


    public setSystemMessage(message: string) {
        this.systemMessage = message;
    }

    public addUserMessage(message: string) {
        this.messageHistory.push({
            role: 'user',
            message: message
        });
    }

    public addAssistantMessage(message: string) {
        this.messageHistory.push({
            role: 'assistant',
            message: message
        });
    }

    public getMessageHistory() {
        return this.messageHistory;
    }

    public resetMessageHistory() {
        this.messageHistory = [];
    }

    public getMessageStruct(): MessageHistory {
        return [
            ({
                role:'system',
                message: this.systemMessage
            } as MessageData),
            ...this.messageHistory.slice(-this.maxHistory), // maxHistory 分送る
        ];
    }

    abstract getPrompt(): string;
}
