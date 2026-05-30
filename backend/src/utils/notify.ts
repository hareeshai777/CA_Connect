import { prisma } from "../config/prisma";
import { NotificationType, NotificationChannel } from "@prisma/client";
import { logger } from "./logger";

interface NotifyData {
  userId: string;
  title: string;
  body: string;
  type?: NotificationType;
  bookingId?: string;
  metadata?: Record<string, any>;
}

/** Create an in-app notification record */
export const createNotification = async (data: NotifyData) => {
  try {
    await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        body: data.body,
        type: data.type ?? NotificationType.GENERAL,
        channel: NotificationChannel.IN_APP,
        bookingId: data.bookingId,
        isRead: false,
        isSent: true,
        sentAt: new Date(),
        metadata: data.metadata,
      },
    });
  } catch (err) {
    logger.error("Failed to create notification", err);
  }
};

/** Send meeting confirmation notifications to client + CA */
export const notifyMeetingConfirmed = async (
  clientUserId: string,
  caUserId: string,
  data: {
    bookingId: string;
    clientName: string;
    caName: string;
    service: string;
    date: string;
    time: string;
    meetLink: string;
  }
) => {
  const clientBody = `Your consultation with CA ${data.caName} for ${data.service} is confirmed.\nDate: ${data.date} | Time: ${data.time}\nMeeting Link: ${data.meetLink}`;
  const caBody = `New booking confirmed from ${data.clientName} for ${data.service}.\nDate: ${data.date} | Time: ${data.time}\nMeeting Link: ${data.meetLink}`;

  await Promise.allSettled([
    createNotification({
      userId: clientUserId,
      title: "✅ Meeting Confirmed!",
      body: clientBody,
      type: NotificationType.MEETING_LINK,
      bookingId: data.bookingId,
      metadata: { meetLink: data.meetLink, date: data.date, time: data.time },
    }),
    createNotification({
      userId: caUserId,
      title: "📅 New Booking Confirmed",
      body: caBody,
      type: NotificationType.BOOKING_CONFIRMED,
      bookingId: data.bookingId,
      metadata: { meetLink: data.meetLink, date: data.date, time: data.time },
    }),
  ]);
};
