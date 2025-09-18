"use client"

import { useTranslations, useLocale } from 'next-intl'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function AboutPage() {
  const t = useTranslations()
  const locale = useLocale()
  const sections = (t as any).raw('pages.about.sections') as {h:string;p:string}[]

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{t('pages.about.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-700">{t('pages.about.intro')}</p>
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
  )
}


