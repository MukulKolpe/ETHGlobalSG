// @ts-nocheck comment
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { guildId, channelData } = req.body;

  if (!guildId || !channelData) {
    return res.status(400).json({ error: "Missing guildId or channelData" });
  }

  const discordApiUrl = `https://discord.com/api/v10/guilds/${guildId}/channels`;
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!botToken) {
    return res.status(500).json({ error: "Discord bot token not configured" });
  }

  try {
    const response = await axios.post(discordApiUrl, channelData, {
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json",
      },
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Error creating Discord channel:",
      error.response?.data || error.message
    );
    return res
      .status(error.response?.status || 500)
      .json({ error: "Failed to create Discord channel" });
  }
}
