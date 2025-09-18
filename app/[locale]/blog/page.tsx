"use client"

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

type BlogPost = { title: string; description: string; date: string; link: string; icon?: string }

export default function BlogPage() {
  const t = useTranslations()
  const [posts, setPosts] = useState<BlogPost[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/blog-posts', { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (isMounted) setPosts(json.data as BlogPost[])
      } catch (e: any) {
        if (isMounted) setError(e?.message || 'Failed to load posts')
      }
    })()
    return () => { isMounted = false }
  }, [])

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">{t('pages.blog.title')}</h1>
            <p className="text-gray-600 mt-2">{t('pages.blog.intro')}</p>
          </div>

          {!posts && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[0,1,2,3].map(i => (
                <Card key={i} className="shadow-sm">
                  <div className="h-32 animate-pulse bg-gray-200 rounded-t" />
                  <CardContent className="space-y-2 pt-4">
                    <div className="h-5 bg-gray-200 rounded w-2/3" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center text-red-600">{error}</div>
          )}

          {posts && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((p, idx) => (
                <Card key={`${p.link}-${idx}`} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold flex items-center space-x-2">
                      {p.icon ? <span className="text-2xl leading-none">{p.icon}</span> : null}
                      <a href={p.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {p.title}
                      </a>
                    </CardTitle>
                    {p.date ? <p className="text-xs text-gray-500">{p.date}</p> : null}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-gray-700">{p.description}</p>
                    <a href={p.link} target="_blank" rel="noopener noreferrer" className="inline-block text-blue-600 hover:underline">
                      Read more →
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <SiteFooter />
    </>
  )
}


