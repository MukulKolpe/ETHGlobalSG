// @ts-nocheck comment
import axios from "axios";

async function updateDiscordPermissions(channelId, userId, permissions) {
  const discordApiUrl = `https://discord.com/api/v9/channels/${channelId}/permissions/${userId}`;
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!botToken) {
    throw new Error("Discord bot token not configured");
  }

  try {
    await axios.put(discordApiUrl, permissions, {
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json",
      },
    });

    return { success: true, message: "Permissions updated successfully" };
  } catch (error) {
    console.error(
      "Error updating Discord permissions:",
      error.response?.data || error.message
    );
    throw new Error("Failed to update Discord permissions");
  }
}

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { channelId, userId, permissions } = req.body;

  if (!channelId || !userId || !permissions) {
    return res
      .status(400)
      .json({ error: "Missing channelId, userId, or permissions" });
  }

  try {
    const result = await updateDiscordPermissions(
      channelId,
      userId,
      permissions
    );
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error });
  }
}
