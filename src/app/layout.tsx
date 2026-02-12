import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "sonner";
// @ts-ignore
import "./globals.css";
import StoreProvider from "./StoreProvider";
import UserInitializer from "./auth/UserInitializer";
import Loader from "@/components/loader/Loader";
import Script from "next/script";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "We Won Academy - Find Top Engineering Colleges",
    template: "%s | We Won Academy",
  },
  description:
    "We Won Academy helps students find and get admitted to top engineering colleges. Get personalized mentorship, college predictions, and counseling support for JEE, UPTAC, JOSAA, and more.",
  keywords: [
    "We Won Academy",
    "engineering colleges",
    "JEE counseling",
    "JOSAA counseling",
    "UPTAC counseling",
    "college predictor",
    "JEE Mains",
    "JEE Advanced",
    "college admissions",
    "engineering admission",
    "We Won Academy",
    "college search India",
  ],
  authors: [{ name: "We Won Academy" }],
  creator: "We Won Academy",
  publisher: "We Won Academy",
  metadataBase: new URL("https://www.wewonacademy.com"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "We Won Academy",
    title: "We Won Academy - Find Top Engineering Colleges",
    description:
      "Get personalized mentorship, college predictions, and counseling support for JEE, UPTAC, JOSAA admissions on We Won Academy.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "We Won Academy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "We Won Academy - Find Top Engineering Colleges",
    description:
      "Get personalized mentorship, college predictions, and counseling support for JEE, UPTAC, JOSAA admissions on We Won Academy.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  verification: {
    // Add your verification codes when you have them
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
  other: {
    "google-adsense-account": "ca-pub-5838698717959983",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5838698717959983"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${poppins.variable} antialiased`}>
        <Loader />

        <Toaster position="top-right" richColors />
        <StoreProvider>
          <UserInitializer />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
