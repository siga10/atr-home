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
  title: "ART HOME | Luxury Interior & Exterior Finishing",
  description:
    "ART HOME - Luxury interior and exterior finishing: execution, design, supervision and high quality.",
  icons: {
    icon: "/logo.png", // لازم تكون الصورة موجودة بـ public/logo.png
  },
  openGraph: {
    title: "ART HOME | Luxury Interior & Exterior Finishing",
    description: `ART HOME - Luxury interior and exterior finishing: execution, design, supervision and high quality.`,
    url: "https://www.arthomeco.com/", // غيّر للرابط الرسمي تبعك
    siteName: "ART HOME",
    images: [
      {
        url: "/logo.png", // أو استبدلها بصورة preview كبيرة (1200x630px)
        width: 1200,
        height: 630,
        alt: "ART HOME Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ART HOME | Luxury Interior & Exterior Finishing",
    description: `ART HOME - Luxury interior and exterior finishing: execution, design, supervision and high quality.`,
    images: ["/logo.png"],
  },
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
