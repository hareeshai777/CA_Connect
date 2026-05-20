import cron from "node-cron";
import { prisma } from "../config/prisma";
import { whatsappService } from "./whatsapp.service";
import { sendEmail } from "./email.service";
import { logger } from "../utils/logger";
import { format, subMinutes } from "date-fns";

export const startNotificationCron = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      await sendUpcomingReminders(60);
      await sendUpcomingReminders(15);
      await markCompletedBookings();
    } catch (err) {
      logger.error("Notification cron error", err);
    }
  });

  logger.info("Notification cron started");
};

const sendUpcomingReminders = async (minutesBefore: number) => {
  const now = new Date();
  const targetTime = new Date(now.getTime() + minutesBefore * 60 * 1000);
  const window = 5 * 60 * 1000;

  const reminderField = minutesBefore === 60 ? "reminderSent60" : "reminderSent15";

  const bookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      scheduledAt: {
        gte: new Date(targetTime.getTime() - window),
        lte: new Date(targetTime.getTime() + window),
      },
      [reminderField]: false,
    },
    include: {
      clientProfile: true,
      caProfessional: { include: { user: true } },
    },
  });

  for (const booking of bookings) {
    const timeStr = `${format(booking.scheduledAt, "dd MMM yyyy")} at ${format(booking.scheduledAt, "hh:mm a")}`;

    await prisma.booking.update({ where: { id: booking.id }, data: { [reminderField]: true } });

    const caUser = await prisma.user.findUnique({ where: { id: booking.caProfessional.userId } });
    const clientUser = await prisma.user.findUnique({ where: { id: booking.clientProfile.userId } });

    await Promise.allSettled([
      clientUser?.phone &&
        whatsappService.sendBookingReminder({
          phone: clientUser.phone,
          name: `${booking.clientProfile.firstName} ${booking.clientProfile.lastName}`,
          caName: `${booking.caProfessional.firstName} ${booking.caProfessional.lastName}`,
          minutesBefore,
          meetLink: booking.meetingLink || "",
        }),
      caUser?.phone &&
        whatsappService.sendBookingReminder({
          phone: caUser.phone,
          name: `${booking.caProfessional.firstName} ${booking.caProfessional.lastName}`,
          caName: `${booking.caProfessional.firstName} ${booking.caProfessional.lastName}`,
          minutesBefore,
          meetLink: booking.meetingLink || "",
        }),
    ]);

    logger.info(`Reminder sent for booking ${booking.bookingNumber} (${minutesBefore}min)`);
  }
};

const markCompletedBookings = async () => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  await prisma.booking.updateMany({
    where: {
      status: "CONFIRMED",
      scheduledAt: { lte: oneHourAgo },
    },
    data: { status: "COMPLETED" },
  });
};
