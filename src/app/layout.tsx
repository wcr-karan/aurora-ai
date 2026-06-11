import type { Metadata, Viewport } from "next";
import { Anton, Archivo, Space_Mono } from "next/font/google";
import "./globals.css";

// Display: ultra-condensed brutalist poster face. Body/UI: Archivo grotesque.
// Data/labels: Space Mono terminal. A deliberately characterful, non-generic trio.
const anton = Anton({
  subsets: ["latin"],
  variable: "--font-anton",
  weight: ["400"],
  display: "swap",
});
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});
const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Helpdesk AI — Deploy an AI support agent trained on your docs",
  description:
    "A multi-tenant platform to build, train, and deploy an AI customer-support assistant on your own knowledge base. Answers, tickets, escalation, and analytics in one deck.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Helpdesk AI",
    description:
      "Build, train, and deploy an AI customer-support assistant on your own knowledge base.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0b0e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${anton.variable} ${archivo.variable} ${spaceMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
