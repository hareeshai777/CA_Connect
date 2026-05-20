import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CA Pro — Connect with Trusted Chartered Accountants",
    template: "%s | CA Pro",
  },
  description:
    "Find expert Chartered Accountants for taxation, GST, audits, company registration, compliance, business consulting, and more.",
  keywords: [
    "chartered accountant",
    "CA services",
    "GST filing",
    "income tax",
    "company registration",
    "audit services",
    "tax consultant India",
  ],
  authors: [{ name: "CA Pro Platform" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    title: "CA Pro — Connect with Trusted Chartered Accountants",
    description: "Find expert Chartered Accountants online for all your financial and compliance needs.",
    siteName: "CA Pro",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${plusJakarta.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{ duration: 4000 }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
