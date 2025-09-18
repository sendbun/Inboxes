"use client"

import { useTranslations } from 'next-intl'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function TermsPage() {
  const t = useTranslations()
  const sections = (t as any).raw('pages.terms.sections') as { h: string; p: string }[]

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{t('pages.terms.title')}</CardTitle>
              <p className="text-sm text-gray-500">{t('pages.terms.updated')}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {sections?.map((s, i) => (
                <section key={i} className="space-y-2">
                  <h2 className="text-lg font-semibold text-gray-900">{s.h}</h2>
                  <p className="text-gray-700">{s.p}</p>
                </section>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      <SiteFooter />
    </>
  )
}


