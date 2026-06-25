import { Geist, Geist_Mono } from "next/font/google";
import GuildStateProvider from "./components/GuildStateProvider";
import { Toaster } from "react-hot-toast";
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
        <GuildStateProvider>
          {children}
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: '#334155', // slate-700
                color: '#f1f5f9',      // slate-100
              },
            }}
          />
        </GuildStateProvider>
      </body>
    </html>
  );
}
