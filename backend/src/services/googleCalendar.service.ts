import { google } from "googleapis";
import { env } from "../config/env";
import { logger } from "../utils/logger";

const getAuth = () => {
  const authConfig: any = {
    credentials: {
      client_email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: env.GOOGLE_PRIVATE_KEY,
    },
    scopes: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ],
  };

  // If a Workspace admin email is set, impersonate them for premium Meet features
  // (requires domain-wide delegation enabled in Google Workspace Admin Console)
  if (env.GOOGLE_WORKSPACE_ADMIN_EMAIL) {
    authConfig.clientOptions = { subject: env.GOOGLE_WORKSPACE_ADMIN_EMAIL };
  }

  return new google.auth.GoogleAuth(authConfig);
};

export interface CalendarEventData {
  summary: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  attendees: { email: string; displayName?: string }[];
  timeZone?: string;
}

export const googleCalendarService = {
  createEvent: async (
    data: CalendarEventData
  ): Promise<{ eventId: string; meetLink: string; eventUrl: string }> => {
    try {
      const auth = getAuth();
      const calendar = google.calendar({ version: "v3", auth });

      const event = await calendar.events.insert({
        calendarId: env.GOOGLE_CALENDAR_ID,
        conferenceDataVersion: 1,
        sendUpdates: "all",
        requestBody: {
          summary: data.summary,
          description: data.description,
          start: {
            dateTime: data.startDateTime,
            timeZone: data.timeZone || "Asia/Kolkata",
          },
          end: {
            dateTime: data.endDateTime,
            timeZone: data.timeZone || "Asia/Kolkata",
          },
          attendees: data.attendees,
          guestsCanInviteOthers: false,
          guestsCanModify: false,
          guestsCanSeeOtherGuests: false,
          conferenceData: {
            createRequest: {
              requestId: `casaas-${Date.now()}`,
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: "email", minutes: 60 },
              { method: "popup", minutes: 15 },
            ],
          },
        },
      });

      const meetLink =
        event.data.conferenceData?.entryPoints?.find(
          (ep) => ep.entryPointType === "video"
        )?.uri || "";

      return {
        eventId: event.data.id || "",
        meetLink,
        eventUrl: event.data.htmlLink || "",
      };
    } catch (err) {
      logger.error("Google Calendar event creation failed", err);
      throw err;
    }
  },

  updateEvent: async (eventId: string, data: Partial<CalendarEventData>) => {
    try {
      const auth = getAuth();
      const calendar = google.calendar({ version: "v3", auth });

      await calendar.events.patch({
        calendarId: env.GOOGLE_CALENDAR_ID,
        eventId,
        sendUpdates: "all",
        requestBody: {
          ...(data.summary && { summary: data.summary }),
          ...(data.description && { description: data.description }),
          ...(data.startDateTime && {
            start: {
              dateTime: data.startDateTime,
              timeZone: data.timeZone || "Asia/Kolkata",
            },
          }),
          ...(data.endDateTime && {
            end: {
              dateTime: data.endDateTime,
              timeZone: data.timeZone || "Asia/Kolkata",
            },
          }),
        },
      });
    } catch (err) {
      logger.error("Google Calendar event update failed", err);
    }
  },

  cancelEvent: async (eventId: string) => {
    try {
      const auth = getAuth();
      const calendar = google.calendar({ version: "v3", auth });
      await calendar.events.delete({
        calendarId: env.GOOGLE_CALENDAR_ID,
        eventId,
        sendUpdates: "all",
      });
    } catch (err) {
      logger.error("Google Calendar event cancellation failed", err);
    }
  },
};
