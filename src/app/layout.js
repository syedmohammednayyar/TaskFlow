import { headers } from "next/headers";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: {
    default: "TaskFlow — Manage. Assign. Complete.",
    template: "%s · TaskFlow",
  },
  description:
    "A modern collaborative task management platform for small teams. Create, assign, and track tasks beautifully.",
  applicationName: "TaskFlow",
  keywords: ["tasks", "task management", "kanban", "team", "productivity"],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1120" },
  ],
};

export default async function RootLayout({ children }) {
  const nonce = (await headers()).get("x-nonce") ?? "";
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers nonce={nonce}>{children}</Providers>
      </body>
    </html>
  );
}
