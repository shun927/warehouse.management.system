import React, { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import '../global.css'; // Corrected path to global.css at the root
import { Inter as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"
import { Toaster } from '@/components/ui/sonner';
import { ThemeProviderClientWrapper } from "@/components/providers/ThemeProviderClientWrapper"; // Import the client wrapper

interface RootLayoutProps {
  children: ReactNode;
}

export const metadata = {
  title: 'Shiba Lab 倉庫管理システム',
  description: 'Shiba Labの備品・機材を管理するためのウェブアプリケーション。',
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  // Add PWA related viewport settings
  appleWebAppCapable: "yes",
  appleMobileWebAppStatusBarStyle: "default",
  appleMobileWebAppTitle: "ShibaLab WMS",
  formatDetection: "telephone=no",
  mobileWebAppCapable: "yes",
  msapplicationTileColor: "#2B5797", // Example color
  msapplicationTapHighlight: "no",
};

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        fontSans.variable
      )}>
        <ThemeProviderClientWrapper
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow container mx-auto px-4 py-6 sm:px-6 lg:px-8">
                  {children}
                </main>
                <Toaster richColors />
                <footer className="bg-muted border-t border-border">
                  <div className="container mx-auto py-4 px-4 text-center text-muted-foreground text-sm">
                    &copy; {new Date().getFullYear()} {metadata.title}. All rights reserved.
                  </div>
                </footer>
              </div>
          </AuthProvider>
        </ThemeProviderClientWrapper>
      </body>
    </html>
  );
}