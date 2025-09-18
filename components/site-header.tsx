"use client"

import Link from "next/link"
import Image from "next/image"
import { useLocale } from 'next-intl'

export function SiteHeader() {
  const locale = useLocale()
  return (
    <header className="bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center space-x-2">
          <Image src="/logo.png" alt="TempMail" width={118} height={48} />
        </Link>
      </div>
    </header>
  )
}


