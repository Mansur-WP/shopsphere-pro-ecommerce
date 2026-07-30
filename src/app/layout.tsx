import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import { Providers } from "@/components/shared/providers";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  title: {
    default: "ShopSphere Pro",
    template: "%s | ShopSphere Pro",
  },
  description:
    "Premium multi-vendor marketplace. Discover curated products from trusted sellers with seamless checkout and fast delivery.",
  keywords: ["marketplace", "ecommerce", "multi-vendor", "shop", "ShopSphere"],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ShopSphere Pro",
    title: "ShopSphere Pro",
    description:
      "Premium multi-vendor marketplace with secure checkout and trusted sellers.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShopSphere Pro",
    description:
      "Premium multi-vendor marketplace with secure checkout and trusted sellers.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${dmSans.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
