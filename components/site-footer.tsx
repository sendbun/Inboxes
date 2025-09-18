"use client"

import Image from "next/image"
import Link from "next/link"
import { useTranslations, useLocale } from 'next-intl'
import { Separator } from "@/components/ui/separator"
import LanguageSwitcher from "@/components/language-switcher"

export function SiteFooter() {
  const t = useTranslations()
  const locale = useLocale()
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4 flex items-center space-x-2">
              <Image src="/logo.png" alt="TempMail" width={118} height={48} />
            </div>
            <p className="text-gray-400">{t('footer.about')}</p>
            <div className="mt-4 flex items-center space-x-3">
              <span className="text-sm text-gray-400">{t('nav.language')}:</span>
              <LanguageSwitcher />
            </div>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-4">{t('footer.featuresTitle')}</h4>
            <ul className="space-y-2 text-gray-400">
              {(t as any).raw('footer.features')?.map((f: string, i: number) => (<li key={i}>{f}</li>))}
            </ul>
          </div>
          <div />
          <div>
            <h4 className="text-md font-semibold mb-4">{t('footer.supportTitle')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link className="hover:text-white" href={`/${locale}/about`}>{t('pages.about.title')}</Link>
              </li>
              <li>
                <Link className="hover:text-white" href={`/${locale}/privacy`}>{t('pages.privacy.title')}</Link>
              </li>
              <li>
                <Link className="hover:text-white" href={`/${locale}/terms`}>{t('pages.terms.title')}</Link>
              </li>
            </ul>
          </div>
        </div>
        <Separator className="my-8 bg-gray-700" />
        <div className="text-center text-gray-400"><p>{t('footer.copyright')}</p></div>
      </div>
    </footer>
  )
}


