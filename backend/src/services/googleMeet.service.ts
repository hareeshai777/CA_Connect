import { JWT } from "google-auth-library";
import axios from "axios";
import { env } from "../config/env";
import { logger } from "../utils/logger";

const getMeetToken = async (): Promise<string> => {
  const client = new JWT({
    email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: env.GOOGLE_PRIVATE_KEY,
    scopes: [
      "https://www.googleapis.com/auth/meetings.space.created",
      "https://www.googleapis.com/auth/meetings.space.readonly",
    ],
    subject: env.GOOGLE_WORKSPACE_ADMIN_EMAIL || undefined,
  });
  const tokenRes = await client.getAccessToken();
  return tokenRes.token || "";
};

export const googleMeetService = {
  // Look up the internal space name from a meeting code (e.g. "abc-def-ghi")
  lookupSpace: async (meetingCode: string): Promise<string | null> => {
    try {
      const token = await getMeetToken();
      const res = await axios.get(
        `https://meet.googleapis.com/v2/spaces:lookup?meetingCode=${meetingCode}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data?.name || null; // e.g. "spaces/jQCFfuBOdN5z"
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
      await axios.post(
        `https://meet.googleapis.com/v2/${name}:endActiveConference`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return true;
    } catch (err: any) {
      logger.error("Meet endConference error", { status: err?.response?.status, space: spaceNameOrCode });
      return false;
    }
  },
};
