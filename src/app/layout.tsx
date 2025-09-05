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
  description: "Luxury interior and exterior finishing: execution, design, supervision and high quality.",
  icons: {
     icon: "/logo.png", // ضيف الأيقونة هنا
  },
};
openGraph: {
    title: "Villa Finishings | Luxury Interior & Exterior Finishing",
    description:
      "Luxury interior and exterior finishing: execution, design, supervision and high quality.",
    url: "https://www.arthomeco.com/", // استبدل بالدومين تبعك
    siteName: "Villa Finishings",
    images: [
      {
        url: "/logo.png", // أو صورة أكبر مخصصة (مثلا 1200x630)
        width: 1200,
        height: 630,
        alt: "Villa Finishings Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Villa Finishings | Luxury Interior & Exterior Finishing",
    description:
      "Luxury interior and exterior finishing: execution, design, supervision and high quality.",
    images: ["/logo.png"], // نفس صورة OG
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
