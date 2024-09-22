// @ts-nocheck comment
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { content, channelId } = req.body;

  if (!content || !channelId) {
    return res.status(400).json({ error: "Missing content or channelId" });
  }

  const discordApiUrl = `https://discord.com/api/v10/channels/${channelId}/messages`;
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!botToken) {
    return res.status(500).json({ error: "Discord bot token not configured" });
  }

  try {
    const response = await axios.post(
      discordApiUrl,
      {
        content,
        flags: 0,
      },
      {
        headers: {
          Authorization: `Bot ${botToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Error creating Discord channel:",
      error.response?.data || error.message
    );
    return res.status(500).json({ error: "Failed to create Discord channel" });
  }
}
