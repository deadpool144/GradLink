import { Inter } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/lib/ReduxProvider";
import AuthProvider from "@/components/AuthProvider";
import LayoutShell from "@/components/LayoutShell";
import AiChatButton from "@/components/AiChatButton";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "GradLink — Alumni Network",
  description: "A premium alumni networking platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} style={{ background: "var(--bg)", color: "var(--text-1)" }}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ReduxProvider>
            <AuthProvider>
              <LayoutShell>{children}</LayoutShell>
              <AiChatButton />
              <Toaster position="top-right" toastOptions={{ className: "dark:bg-slate-800 dark:text-white" }} />
            </AuthProvider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
