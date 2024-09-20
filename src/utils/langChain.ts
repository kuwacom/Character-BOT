import env from "../configs/env";
import { RemoteRunnable } from "langchain/runnables/remote";
import Llama3Chat from "./llama3Chat";

export namespace ChatManager {
    export const chatHistories: { [sessionId: string]: Llama3Chat } = {};

    export function getChat(sessionId: string) {
        if (!(sessionId in chatHistories)) return null;
        return chatHistories[sessionId];
    }

    export function createChat(sessionId: string, chat: Llama3Chat) {
        if (sessionId in chatHistories) return null;
        chatHistories[sessionId] = chat;
        return chatHistories[sessionId];
    }

    export function deleteChat(sessionId: string) {
        if (!(sessionId in chatHistories)) return false;
        delete chatHistories[sessionId];
        return true;
    }
}

export function createChainLlama3() {
    return new RemoteRunnable({
        url: env.LANGSERVE_API_ENDPOINT + "/llama3",
    });
};