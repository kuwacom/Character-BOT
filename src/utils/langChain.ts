import env from "../configs/env";
import { RemoteRunnable } from "langchain/runnables/remote";
import ChatBase from "./chat/chatBase";

export namespace ChatManager {
    export const chatHistories: { [sessionId: string]: ChatBase } = {};

    export function getChat<T extends ChatBase>(sessionId: string): T | null {
        if (!(sessionId in chatHistories)) return null;
        return chatHistories[sessionId] as T;
    }

    export function createChat<T extends ChatBase>(sessionId: string, chat: T): T | null {
        if (sessionId in chatHistories) return null;
        chatHistories[sessionId] = chat;
        return chatHistories[sessionId] as T;
    }

    export function deleteChat(sessionId: string): boolean {
        if (!(sessionId in chatHistories)) return false;
        delete chatHistories[sessionId];
        return true;
    }
}

export function createLlama3Chain() {
    return new RemoteRunnable({
        url: env.LANGSERVE_API_ENDPOINT + "/llama3",
    });
};