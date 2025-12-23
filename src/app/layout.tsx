import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito, Baloo_2 } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { SyncManager } from "@/components/SyncManager";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["600"],
});

export const metadata: Metadata = {
  title: "Mathie",
  description: "Math learning game for Cambridge Primary Checkpoint",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#FFD6E0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fredoka.variable} ${nunito.variable} ${baloo.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
        <ServiceWorkerRegistration />
        <SyncManager />
      </body>
    </html>
  );
}
