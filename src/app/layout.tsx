import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LanDev - Enterprise Portal",
  description: "Enterprise-ready multi-tenant administration portal with futuristic UI",
  keywords: ["admin", "dashboard", "enterprise", "multi-tenant", "RBAC"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider>
          <I18nProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
