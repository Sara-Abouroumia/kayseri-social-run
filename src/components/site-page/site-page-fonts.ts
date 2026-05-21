import { Bebas_Neue, DM_Sans, Playfair_Display, Space_Mono } from "next/font/google";

export const ksrDisplay = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-ksr-display",
  display: "swap",
});

export const ksrBody = DM_Sans({
  subsets: ["latin"],
  variable: "--font-ksr-body",
  display: "swap",
});

export const ksrMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-ksr-mono",
  display: "swap",
});

export const ksrQuote = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ksr-quote",
  display: "swap",
});

export const ksrFontClassName = `${ksrDisplay.variable} ${ksrBody.variable} ${ksrMono.variable} ${ksrQuote.variable}`;
