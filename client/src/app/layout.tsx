import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Workout Pal",
    template: "%s | Workout Pal"
  },
  description: "AI-powered workout generator and fitness tracking companion. Get personalized workout routines, track your progress, and achieve your fitness goals.",
  keywords: ["workout", "fitness", "AI", "exercise", "training", "gym", "strength", "cardio"],
  authors: [{ name: "Workout Pal" }],
  creator: "Workout Pal",
  publisher: "Workout Pal",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'http://localhost:3000',
    title: 'Workout Pal - AI-Powered Fitness Companion',
    description: 'AI-powered workout generator and fitness tracking companion. Get personalized workout routines, track your progress, and achieve your fitness goals.',
    siteName: 'Workout Pal',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Workout Pal - AI-Powered Fitness Companion',
    description: 'AI-powered workout generator and fitness tracking companion. Get personalized workout routines, track your progress, and achieve your fitness goals.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
