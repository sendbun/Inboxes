import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TempMail - Free Temporary Email Address Generator | Anonymous & Secure",
  description: "Get a free temporary email address instantly. Receive emails anonymously with our secure, private, and disposable email service. No registration required, protect your privacy online.",
  keywords: [
    "temporary email",
    "disposable email",
    "free email",
    "anonymous email",
    "fake email",
    "temp mail",
    "email generator",
    "privacy email",
    "secure email",
    "spam protection",
    "email privacy",
    "temporary mailbox",
    "disposable mailbox",
    "anonymous mailbox",
    "email protection"
  ],
  authors: [{ name: "TempMail" }],
  creator: "TempMail",
  publisher: "TempMail",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://tempmail.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "TempMail - Free Temporary Email Address Generator",
    description: "Get a free temporary email address instantly. Receive emails anonymously with our secure, private, and disposable email service. No registration required.",
    url: 'https://tempmail.com',
    siteName: 'TempMail',
    images: [
      {
        url: '/placeholder-logo.png',
        width: 1200,
        height: 630,
        alt: 'TempMail - Free Temporary Email Service',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "TempMail - Free Temporary Email Address Generator",
    description: "Get a free temporary email address instantly. Receive emails anonymously with our secure, private, and disposable email service.",
    images: ['/placeholder-logo.png'],
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
  verification: {
    google: 'your-google-verification-code',
  },
  category: 'technology',
  classification: 'Free Temporary Email Service',
  generator: 'Next.js'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}<Toaster /></body>
    </html>
  )
}
