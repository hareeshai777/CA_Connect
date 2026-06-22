import axios from "axios";
import { env } from "../config/env";
import { logger } from "../utils/logger";

let cachedToken: { token: string; expiresAt: number } | null = null;

const getAccessToken = async (): Promise<string> => {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.token;
  }

  const { data } = await axios.post(`${env.ZOHO_ACCOUNTS_URL}/oauth/v2/token`, null, {
    params: {
      refresh_token: env.ZOHO_REFRESH_TOKEN,
      client_id: env.ZOHO_CLIENT_ID,
      client_secret: env.ZOHO_CLIENT_SECRET,
      grant_type: "refresh_token",
    },
  });

  if (!data?.access_token) {
    throw new Error(`Zoho token refresh failed: ${JSON.stringify(data)}`);
  }

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
  };
  return cachedToken.token;
};

const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

export interface ZohoMeetingParticipant {
  email: string;
  name?: string;
}

export interface CreateZohoMeetingData {
  topic: string;
  presenterEmail: string;
  startTime: Date;
  durationMinutes: number;
  participants?: ZohoMeetingParticipant[];
}

export interface ZohoMeetingResult {
  joinLink: string;
  meetingKey: string;
}

export const zohoMeetingService = {
  isConfigured: () =>
    Boolean(env.ZOHO_CLIENT_ID && env.ZOHO_CLIENT_SECRET && env.ZOHO_REFRESH_TOKEN && env.ZOHO_ZSOID),

  createMeeting: async (data: CreateZohoMeetingData): Promise<ZohoMeetingResult> => {
    if (!zohoMeetingService.isConfigured()) {
      throw new Error("Zoho Meeting is not configured");
    }

    const token = await getAccessToken();

    const { data: res } = await axios.post(
      `${env.ZOHO_MEETING_API_URL}/api/v2/${env.ZOHO_ZSOID}/sessions`,
      {
        session: {
          topic: data.topic,
          presenter: data.presenterEmail,
          agenda: data.topic,
          startTime: data.startTime.getTime(),
          duration: formatDuration(data.durationMinutes),
          timezone: "Asia/Calcutta",
          participants: data.participants?.map((p) => ({ email: p.email, name: p.name || "" })),
        },
      },
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const session = res?.session || res;
    const joinLink: string | undefined = session?.joinLink || session?.joinUrl || session?.meetingUrl;
    const meetingKey: string = session?.meetingKey || session?.meetingId || "";

    if (!joinLink) {
      logger.error("Zoho Meeting: no join link in response", res);
      throw new Error("Zoho Meeting did not return a join link");
    }

    return { joinLink, meetingKey };
  },

  cancelMeeting: async (meetingKey: string) => {
    if (!zohoMeetingService.isConfigured() || !meetingKey) return;
    try {
      const token = await getAccessToken();
      await axios.delete(`${env.ZOHO_MEETING_API_URL}/api/v2/${env.ZOHO_ZSOID}/sessions/${meetingKey}`, {
        headers: { Authorization: `Zoho-oauthtoken ${token}` },
      });
    } catch (err) {
      logger.error("Zoho Meeting cancellation failed", err);
    }
  },
};
