import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "../context/AppContext";
import MainLayout from "../components/MainLayout";
import SettingsModal from "../components/SettingsModal";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AxioMath — AI Education Platform",
  description: "AI-powered education platform for math, physics, and chemistry. Solve problems, create video lessons.",
  icons: {
    icon: '/favicon.ico',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <AppProvider>
          <MainLayout>
            {children}
          </MainLayout>
          <SettingsModal />
        </AppProvider>
      </body>
    </html>
  );
}
