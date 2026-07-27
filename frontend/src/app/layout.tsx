import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "../context/AppContext";
import MainLayout from "../components/MainLayout";
import SettingsModal from "../components/SettingsModal";

export const metadata: Metadata = {
  title: "AiEducation",
  description: "Education AI Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
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
