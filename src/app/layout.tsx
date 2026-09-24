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
    default: "Africhina Connect",
    template: "%s | Africhina Connect",
  },
  description:
    "China to Nigeria ecommerce and product sourcing platform. Direct access to verified Chinese suppliers, handled shipping coordination, and clear order tracking.",
  keywords: [
    "Africhina Connect",
    "China to Nigeria",
    "product sourcing",
    "import to Nigeria",
    "ecommerce",
    "Nigeria trade",
    "cross-border commerce",
  ],
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "Africhina Connect",
    title: "Africhina Connect — China to Nigeria Sourcing & Ecommerce",
    description:
      "Direct product sourcing from China to Nigeria with handled logistics coordination and end-to-end order tracking.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Africhina Connect",
    description:
      "Direct product sourcing from China to Nigeria with handled logistics coordination and end-to-end order tracking.",
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
