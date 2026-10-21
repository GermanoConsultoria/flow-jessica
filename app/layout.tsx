import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import BotaoWhatsApp from "@/components/BotaoWhatsApp";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Flow",
  description: "Sistema de Gestão",
  icons: {
    icon: '/favicon.ico',
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground`}>
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-right" />
          <BotaoWhatsApp />
        </ThemeProvider>
      </body>
    </html>
  );
}