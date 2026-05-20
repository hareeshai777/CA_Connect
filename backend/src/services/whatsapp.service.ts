import axios from "axios";
import { env } from "../config/env";
import { logger } from "../utils/logger";

const WA_API_URL = `https://graph.facebook.com/v19.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

const waHeaders = {
  Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
  "Content-Type": "application/json",
};

const sendWhatsApp = async (to: string, body: object) => {
  try {
    const normalizedPhone = to.startsWith("+") ? to.slice(1) : to;
    await axios.post(
      WA_API_URL,
      { messaging_product: "whatsapp", to: normalizedPhone, ...body },
      { headers: waHeaders }
    );
    logger.info(`WhatsApp sent to ${to}`);
  } catch (err: any) {
    logger.error("WhatsApp send failed", {
      to,
      error: err?.response?.data || err.message,
    });
  }
};

export const whatsappService = {
  sendBookingConfirmation: async (data: {
    phone: string;
    clientName: string;
    caName: string;
    service: string;
    date: string;
    time: string;
    meetLink: string;
    bookingNumber: string;
  }) => {
    await sendWhatsApp(data.phone, {
      type: "text",
      text: {
        body:
          `✅ *Booking Confirmed!*\n\n` +
          `📋 *Booking ID:* ${data.bookingNumber}\n` +
          `👨‍💼 *CA Professional:* ${data.caName}\n` +
          `📁 *Service:* ${data.service}\n` +
          `📅 *Date:* ${data.date}\n` +
          `⏰ *Time:* ${data.time}\n\n` +
          `🔗 *Meeting Link:*\n${data.meetLink}\n\n` +
          `_Please join 5 minutes before the scheduled time._\n` +
          `_CA SaaS Platform_`,
      },
    });
  },

  sendBookingReminder: async (data: {
    phone: string;
    name: string;
    caName: string;
    minutesBefore: number;
    meetLink: string;
  }) => {
    await sendWhatsApp(data.phone, {
      type: "text",
      text: {
        body:
          `⏰ *Reminder: Meeting in ${data.minutesBefore} minutes*\n\n` +
          `Your consultation with *${data.caName}* starts soon.\n\n` +
          `🔗 *Meeting Link:*\n${data.meetLink}\n\n` +
          `_CA SaaS Platform_`,
      },
    });
  },

  sendPaymentConfirmation: async (data: {
    phone: string;
    name: string;
    amount: number;
    orderId: string;
    description: string;
  }) => {
    await sendWhatsApp(data.phone, {
      type: "text",
      text: {
        body:
          `💳 *Payment Successful!*\n\n` +
          `Amount: *₹${(data.amount / 100).toFixed(2)}*\n` +
          `Order ID: ${data.orderId}\n` +
          `For: ${data.description}\n\n` +
          `_Thank you, ${data.name}!_\n` +
          `_CA SaaS Platform_`,
      },
    });
  },

  sendCAActivation: async (data: { phone: string; caName: string }) => {
    await sendWhatsApp(data.phone, {
      type: "text",
      text: {
        body:
          `🎉 *Welcome to CA SaaS Platform, ${data.caName}!*\n\n` +
          `Your CA Professional account is now *Active*.\n\n` +
          `You can now log in to your dashboard and start accepting client bookings.\n\n` +
          `_CA SaaS Platform_`,
      },
    });
  },

  sendCancellationAlert: async (data: {
    phone: string;
    name: string;
    bookingNumber: string;
    reason?: string;
  }) => {
    await sendWhatsApp(data.phone, {
      type: "text",
      text: {
        body:
          `❌ *Booking Cancelled*\n\n` +
          `Booking ID: ${data.bookingNumber}\n` +
          (data.reason ? `Reason: ${data.reason}\n` : "") +
          `\nIf you have questions, contact support.\n` +
          `_CA SaaS Platform_`,
      },
    });
  },
};
