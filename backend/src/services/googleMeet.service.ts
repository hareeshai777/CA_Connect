import { google } from "googleapis";
import { env } from "../config/env";
import { logger } from "../utils/logger";

const getMeetToken = async (): Promise<string> => {
  const authConfig: any = {
    credentials: {
      client_email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: env.GOOGLE_PRIVATE_KEY,
    },
    scopes: [
      "https://www.googleapis.com/auth/meetings.space.created",
      "https://www.googleapis.com/auth/meetings.space.readonly",
    ],
  };
  if (env.GOOGLE_WORKSPACE_ADMIN_EMAIL) {
    authConfig.clientOptions = { subject: env.GOOGLE_WORKSPACE_ADMIN_EMAIL };
  }
  const auth = new google.auth.GoogleAuth(authConfig);
  const client = await auth.getClient();
  const tokenRes = await (client as any).getAccessToken();
  return tokenRes.token || "";
};

export const googleMeetService = {
  // Look up the internal space name from a meeting code (e.g. "abc-def-ghi")
  lookupSpace: async (meetingCode: string): Promise<string | null> => {
    try {
      const token = await getMeetToken();
      const res = await fetch(
        `https://meet.googleapis.com/v2/spaces:lookup?meetingCode=${meetingCode}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return null;
      const data = await res.json() as any;
      return data.name || null; // e.g. "spaces/jQCFfuBOdN5z"
    } catch (err) {
      logger.error("Meet space lookup failed", err);
      return null;
    }
  },

  // End the active conference for a space (kicks all participants)
  endConference: async (spaceNameOrCode: string): Promise<boolean> => {
    try {
      const token = await getMeetToken();
      // Ensure it's a full resource name
      const name = spaceNameOrCode.startsWith("spaces/")
        ? spaceNameOrCode
        : `spaces/${spaceNameOrCode}`;
      const res = await fetch(
        `https://meet.googleapis.com/v2/${name}:endActiveConference`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: "{}",
        }
      );
      if (!res.ok) {
        logger.error("Meet endConference failed", { status: res.status, space: name });
        return false;
      }
      return true;
    } catch (err) {
      logger.error("Meet endConference error", err);
      return false;
    }
  },
};
