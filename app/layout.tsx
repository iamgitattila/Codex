import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Mastery for Teams - Learn AI Skills, Get Certified",
  description: "Structured AI courses for professionals and teams. Learn ChatGPT, Prompt Engineering, AI Tools, and more. Get certified and level up your career.",
  keywords: ["AI training", "AI courses", "ChatGPT course", "Prompt engineering", "AI certification", "Corporate AI training"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
