import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { UsagePageTracker } from "@/components/usage-page-tracker";
import { getLocale } from "@/i18n/get-locale";
import { getSiteUrl } from "@/lib/site-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Kayseri Social Run",
    template: "%s · Kayseri Social Run",
  },
  description: "Social club activities, attendance, and coordination in Kayseri.",
  icons: {
    icon: "/kayserisocialrun_logo.png",
    apple: "/kayserisocialrun_logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <>
      <SpeedInsights />
      <Analytics />
      <html
        lang={locale}
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <body className="flex min-h-full min-w-0 flex-col" suppressHydrationWarning>
          <Suspense fallback={null}>
            <UsagePageTracker />
          </Suspense>
          {children}
        </body>
      </html>
    </>
  );
}
