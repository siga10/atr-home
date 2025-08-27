import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ContentProvider } from "@/components/ContentProvider";
import SiteChrome from "@/components/SiteChrome";
import { AuthProvider } from "@/components/AuthProvider";
import { DynamicTitle } from "@/components/DynamicTitle";
import { ContentProtection } from "@/components/ContentProtection";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Villa Finishings | Luxury Interior & Exterior Finishing",
  description: "Luxury interior and exterior finishing: execution, design, supervision and high quality.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <ContentProvider>
            <ContentProtection />
            <DynamicTitle />
            <SiteChrome>{children}</SiteChrome>
          </ContentProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
