import { Geist, Geist_Mono } from "next/font/google";
import GuildStateProvider from "./components/GuildStateProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Guild Watch",
  description: "A guild monitoring site for Free Fire, Call of Duty, and upcoming game themes.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GuildStateProvider>{children}</GuildStateProvider>
      </body>
    </html>
  );
}
