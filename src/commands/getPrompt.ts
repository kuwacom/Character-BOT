import Discord from "discord.js";
import { DiscordCommandInteraction } from "../types/discord";
import { ChatManager } from "../utils/langChain";

export const command = {
    name: "get-prompt",
    description: "現在のプロンプトを取得"
}


export const executeMessage = async (message: Discord.Message) => {
    if (!message.guild || !message.member || message.channel.type == Discord.ChannelType.GuildStageVoice) return;  // v14からステージチャンネルからだとsendできない
    // messageCommand

}

export const executeInteraction = async (interaction: DiscordCommandInteraction) => {
    if (!interaction.guild || !interaction.channel || !interaction.member || !interaction.isChatInputCommand()) return;
    // interactionCommand

    const chat = ChatManager.getChat(interaction.channel.id);
    if (!chat) {
        interaction.reply({
            content: "このチャンネルの履歴はありません",
            ephemeral: true
        });
        return;
    }

    interaction.reply({
        content: "```\n" + chat.getPrompt() + "\n```",
        ephemeral: true
    });
}
