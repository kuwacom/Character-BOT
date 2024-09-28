import Discord from "discord.js";

// (Discord.DefaultWebSocketManagerOptions.identifyProperties.browser as any) = "Discord iOS"

const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildVoiceStates,
        Discord.GatewayIntentBits.GuildMessageReactions,
        Discord.GatewayIntentBits.DirectMessageReactions,
        Discord.GatewayIntentBits.GuildEmojisAndStickers,

        Discord.GatewayIntentBits.GuildMessageTyping, // 文字を入力中
    ],
});

export default client;