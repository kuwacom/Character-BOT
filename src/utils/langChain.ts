import env from "../configs/env";
import { RemoteRunnable } from "langchain/runnables/remote";
import ChatBase from "./chat/chatBase";
import { Runnable } from "@langchain/core/dist/runnables/base";

export namespace ChatManager {
    const chatHistories: { [sessionId: string]: ChatBase } = {};

    export function getChat<Chat extends ChatBase>(sessionId: string): Chat | null {
        if (!(sessionId in chatHistories)) return null;
        return chatHistories[sessionId] as Chat;
    }

    export function createChat<Chat extends ChatBase>(sessionId: string, chat: Chat): Chat | null {
        if (sessionId in chatHistories) return null;
        chatHistories[sessionId] = chat;
        return chatHistories[sessionId] as Chat;
    }

    export function deleteChat(sessionId: string): boolean {
        if (!(sessionId in chatHistories)) return false;
        delete chatHistories[sessionId];
        return true;
    }
}

export function createLlama3Runnable() {
    return new RemoteRunnable({
        url: env.LANGSERVE_API_ENDPOINT + "/llama3",
    });
};