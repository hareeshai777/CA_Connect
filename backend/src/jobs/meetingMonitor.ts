import cron from "node-cron";
import { prisma } from "../config/prisma";
import { googleMeetService } from "../services/googleMeet.service";
import { logger } from "../utils/logger";

// Runs every minute — ends Google Meet calls whose 45-min window has passed
export const startMeetingMonitor = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      // Find CONFIRMED bookings whose scheduledAt + duration has passed and have a meetingCode
      const expired = await prisma.booking.findMany({
        where: {
          status: "CONFIRMED",
          meetingCode: { not: null },
          scheduledAt: {
            // scheduledAt + 45 min < now  →  scheduledAt < now - 45 min
            lt: new Date(now.getTime() - 45 * 60 * 1000),
          },
        },
        select: { id: true, meetingCode: true },
      });

      for (const booking of expired) {
        if (!booking.meetingCode) continue;

        // Look up the internal space name from the meeting code
        const spaceName = await googleMeetService.lookupSpace(booking.meetingCode);
        if (spaceName) {
          const ended = await googleMeetService.endConference(spaceName);
          if (ended) logger.info(`Meeting ended for booking ${booking.id}`);
        }

        // Mark booking as COMPLETED regardless of whether Meet API succeeded
        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: "COMPLETED" },
        });
      }
    } catch (err) {
      logger.error("Meeting monitor error", err);
    }
  });

  logger.info("Meeting monitor started — checks every minute for 45-min cutoff");
};
