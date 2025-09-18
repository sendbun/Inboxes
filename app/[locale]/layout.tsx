import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import { Toaster } from "@/components/ui/sonner"
import { NextIntlClientProvider } from 'next-intl'
import { getLocaleMessages } from "@/lib/i18n-config"
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TempMail - Free Temporary Email Address Generator | Anonymous & Secure",
  description: "Get a free temporary email address instantly. Receive emails anonymously with our secure, private, and disposable email service. No registration required, protect your privacy online.",
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = getLocaleMessages(locale)
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/placeholder-logo.svg" />
        <link rel="apple-touch-icon" href="/placeholder-logo.png" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "TempMail",
              "description": "Free temporary email address generator for anonymous and secure email communication",
              "url": "https://tempmail.com",
              "applicationCategory": "CommunicationApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "Free temporary email addresses",
                "Anonymous email reception",
                "No registration required",
                "Instant email generation",
                "Privacy protection",
                "Spam prevention"
              ]
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SiteHeader />
          {children}
          <SiteFooter />
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}


