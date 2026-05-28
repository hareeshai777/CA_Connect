import nodemailer from "nodemailer";
import { env } from "../config/env";
import { logger } from "../utils/logger";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (opts: EmailOptions) => {
  try {
    await transporter.sendMail({ from: env.EMAIL_FROM, ...opts });
    logger.info(`Email sent to ${opts.to}: ${opts.subject}`);
  } catch (err) {
    logger.error("Email send failed", { err, to: opts.to });
  }
};

export const emailTemplates = {
  otpVerification: (otp: string, name: string) => ({
    subject: "Your Verification Code - CA SaaS",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:40px 20px">
        <div style="background:#fff;border-radius:12px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,.1)">
          <div style="text-align:center;margin-bottom:32px">
            <h1 style="color:#1e40af;font-size:28px;margin:0">CA<span style="color:#f59e0b">Pro</span></h1>
          </div>
          <h2 style="color:#1e293b;font-size:22px">Hello, ${name}!</h2>
          <p style="color:#475569;line-height:1.6">Your one-time password for verification:</p>
          <div style="background:#eff6ff;border:2px solid #bfdbfe;border-radius:8px;padding:24px;text-align:center;margin:24px 0">
            <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#1e40af">${otp}</span>
          </div>
          <p style="color:#64748b;font-size:14px">This code expires in <strong>10 minutes</strong>. Do not share it.</p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
          <p style="color:#94a3b8;font-size:12px;text-align:center">© ${new Date().getFullYear()} CA SaaS Platform</p>
        </div>
      </div>`,
  }),

  bookingConfirmation: (data: {
    clientName: string;
    caName: string;
    service: string;
    date: string;
    time: string;
    meetLink: string;
    bookingNumber: string;
  }) => ({
    subject: `Booking Confirmed: ${data.bookingNumber} - CA SaaS`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:40px 20px">
        <div style="background:#fff;border-radius:12px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,.1)">
          <div style="text-align:center;margin-bottom:32px">
            <h1 style="color:#1e40af;font-size:28px;margin:0">CA<span style="color:#f59e0b">Pro</span></h1>
          </div>
          <div style="background:#f0fdf4;border-radius:8px;padding:16px;margin-bottom:24px;border-left:4px solid #22c55e">
            <p style="color:#15803d;font-weight:600;margin:0">✓ Booking Confirmed!</p>
          </div>
          <h2 style="color:#1e293b">Hi ${data.clientName},</h2>
          <p style="color:#475569">Your consultation has been booked successfully.</p>
          <table style="width:100%;border-collapse:collapse;margin:24px 0">
            <tr><td style="padding:12px;background:#f8fafc;color:#64748b;border-radius:4px 0 0 4px;width:40%">Booking ID</td><td style="padding:12px;font-weight:600;color:#1e293b">${data.bookingNumber}</td></tr>
            <tr><td style="padding:12px;color:#64748b">CA Professional</td><td style="padding:12px;font-weight:600;color:#1e293b">${data.caName}</td></tr>
            <tr><td style="padding:12px;background:#f8fafc;color:#64748b">Service</td><td style="padding:12px;background:#f8fafc;font-weight:600;color:#1e293b">${data.service}</td></tr>
            <tr><td style="padding:12px;color:#64748b">Date</td><td style="padding:12px;font-weight:600;color:#1e293b">${data.date}</td></tr>
            <tr><td style="padding:12px;background:#f8fafc;color:#64748b">Time</td><td style="padding:12px;background:#f8fafc;font-weight:600;color:#1e293b">${data.time}</td></tr>
          </table>
          <a href="${data.meetLink}" style="display:block;background:#1e40af;color:#fff;text-align:center;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px">Join Meeting</a>
          <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:32px">© ${new Date().getFullYear()} CA SaaS Platform</p>
        </div>
      </div>`,
  }),

  rescheduleConfirmation: (data: {
    clientName: string;
    caName: string;
    service: string;
    newDate: string;
    newTime: string;
    meetLink: string;
    bookingNumber: string;
    rescheduledBy: "CLIENT" | "CA";
  }) => ({
    subject: `Meeting Rescheduled: ${data.bookingNumber} - CA SaaS`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:40px 20px">
        <div style="background:#fff;border-radius:12px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,.1)">
          <div style="text-align:center;margin-bottom:32px">
            <h1 style="color:#1e40af;font-size:28px;margin:0">CA<span style="color:#f59e0b">Pro</span></h1>
          </div>
          <div style="background:#fffbeb;border-radius:8px;padding:16px;margin-bottom:24px;border-left:4px solid #f59e0b">
            <p style="color:#b45309;font-weight:600;margin:0">📅 Meeting Rescheduled</p>
          </div>
          <h2 style="color:#1e293b">Hi ${data.clientName},</h2>
          <p style="color:#475569">Your consultation has been rescheduled by ${data.rescheduledBy === "CA" ? `CA ${data.caName}` : "you"}. Here are the updated details:</p>
          <table style="width:100%;border-collapse:collapse;margin:24px 0">
            <tr><td style="padding:12px;background:#f8fafc;color:#64748b;width:40%">Booking ID</td><td style="padding:12px;font-weight:600;color:#1e293b">${data.bookingNumber}</td></tr>
            <tr><td style="padding:12px;color:#64748b">CA Professional</td><td style="padding:12px;font-weight:600;color:#1e293b">${data.caName}</td></tr>
            <tr><td style="padding:12px;background:#f8fafc;color:#64748b">Service</td><td style="padding:12px;background:#f8fafc;font-weight:600;color:#1e293b">${data.service}</td></tr>
            <tr><td style="padding:12px;color:#64748b">New Date</td><td style="padding:12px;font-weight:600;color:#059669">${data.newDate}</td></tr>
            <tr><td style="padding:12px;background:#f8fafc;color:#64748b">New Time</td><td style="padding:12px;background:#f8fafc;font-weight:600;color:#059669">${data.newTime}</td></tr>
          </table>
          <a href="${data.meetLink}" style="display:block;background:#1e40af;color:#fff;text-align:center;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px">Join Meeting</a>
          <p style="color:#64748b;font-size:13px;margin-top:16px">Please add this to your calendar. The meeting link remains the same.</p>
          <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:32px">© ${new Date().getFullYear()} CA SaaS Platform</p>
        </div>
      </div>`,
  }),

  meetingDetails: (data: {
    clientName: string;
    caName: string;
    service: string;
    date: string;
    time: string;
    meetLink: string;
    bookingNumber: string;
  }) => ({
    subject: `Your Meeting Details: ${data.bookingNumber} - CA SaaS`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:40px 20px">
        <div style="background:#fff;border-radius:12px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,.1)">
          <div style="text-align:center;margin-bottom:32px">
            <h1 style="color:#1e40af;font-size:28px;margin:0">CA<span style="color:#f59e0b">Pro</span></h1>
          </div>
          <div style="background:#eff6ff;border-radius:8px;padding:16px;margin-bottom:24px;border-left:4px solid #3b82f6">
            <p style="color:#1d4ed8;font-weight:600;margin:0">📋 Your Meeting Details</p>
          </div>
          <h2 style="color:#1e293b">Hi ${data.clientName},</h2>
          <p style="color:#475569">Here are your upcoming consultation details with CA ${data.caName}:</p>
          <table style="width:100%;border-collapse:collapse;margin:24px 0">
            <tr><td style="padding:12px;background:#f8fafc;color:#64748b;width:40%">Booking ID</td><td style="padding:12px;font-weight:600;color:#1e293b">${data.bookingNumber}</td></tr>
            <tr><td style="padding:12px;color:#64748b">CA Professional</td><td style="padding:12px;font-weight:600;color:#1e293b">${data.caName}</td></tr>
            <tr><td style="padding:12px;background:#f8fafc;color:#64748b">Service</td><td style="padding:12px;background:#f8fafc;font-weight:600;color:#1e293b">${data.service}</td></tr>
            <tr><td style="padding:12px;color:#64748b">Date</td><td style="padding:12px;font-weight:600;color:#1e293b">${data.date}</td></tr>
            <tr><td style="padding:12px;background:#f8fafc;color:#64748b">Time</td><td style="padding:12px;background:#f8fafc;font-weight:600;color:#1e293b">${data.time}</td></tr>
          </table>
          <a href="${data.meetLink}" style="display:block;background:#1e40af;color:#fff;text-align:center;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px">Join Meeting</a>
          <p style="color:#64748b;font-size:13px;margin-top:16px">Join 5 minutes before the scheduled time. Keep this email handy.</p>
          <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:32px">© ${new Date().getFullYear()} CA SaaS Platform</p>
        </div>
      </div>`,
  }),

  caActivation: (data: { caName: string }) => ({
    subject: "Your CA Account is Active - CA SaaS",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:40px 20px">
        <div style="background:#fff;border-radius:12px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,.1)">
          <div style="text-align:center;margin-bottom:32px">
            <h1 style="color:#1e40af;font-size:28px;margin:0">CA<span style="color:#f59e0b">Pro</span></h1>
          </div>
          <h2 style="color:#1e293b">Welcome aboard, ${data.caName}!</h2>
          <p style="color:#475569;line-height:1.6">
            Your CA Professional account has been activated. You can now log in to your dashboard and start accepting client consultations.
          </p>
          <a href="${env.FRONTEND_URL}/ca/dashboard" style="display:block;background:#1e40af;color:#fff;text-align:center;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;margin:24px 0">Go to Dashboard</a>
          <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:32px">© ${new Date().getFullYear()} CA SaaS Platform</p>
        </div>
      </div>`,
  }),

  passwordReset: (resetLink: string, name: string) => ({
    subject: "Reset Your Password - CA SaaS",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:40px 20px">
        <div style="background:#fff;border-radius:12px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,.1)">
          <div style="text-align:center;margin-bottom:32px">
            <h1 style="color:#1e40af;font-size:28px;margin:0">CA<span style="color:#f59e0b">Pro</span></h1>
          </div>
          <h2 style="color:#1e293b">Hi ${name},</h2>
          <p style="color:#475569">You requested a password reset. Click below to set a new password:</p>
          <a href="${resetLink}" style="display:block;background:#1e40af;color:#fff;text-align:center;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;margin:24px 0">Reset Password</a>
          <p style="color:#64748b;font-size:14px">This link expires in <strong>1 hour</strong>. If you didn't request this, ignore this email.</p>
          <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:32px">© ${new Date().getFullYear()} CA SaaS Platform</p>
        </div>
      </div>`,
  }),
};
