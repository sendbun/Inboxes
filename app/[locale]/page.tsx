"use client"

export const dynamic = "force-dynamic"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Mail, 
  UserPlus, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Shield, 
  Lock, 
  Zap, 
  Users, 
  RefreshCw,
  Copy,
  Check,
  ArrowRight,
  FileText,
  Smartphone,
  Globe,
  Key,
  Clock,
  Trash2,
  MessageSquare,
  Bell,
  Search,
  Filter
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useLocale, useTranslations } from 'next-intl'
import { useUserAccounts } from "@/hooks/use-user-accounts"
import { useDomains } from "@/hooks/use-domains"
import { validatePassword, isUserLoggedIn } from "@/lib/user-account-service"
import { generateStrongPassword } from "@/lib/email-service"
import LanguageSwitcher, { languageOptions } from "@/components/language-switcher"

export default function HomePage() {
  const locale = useLocale()
  const t = useTranslations()
  const [tab, setTab] = useState("create")
  const [copied, setCopied] = useState(false)
  
  // Login state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginErrors, setLoginErrors] = useState<string[]>([])
  
  // Create account state
  const [displayName, setDisplayName] = useState("")
  const [errors, setErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  
  const router = useRouter()
  const { isAuthenticated, signup, login, refreshUserData } = useUserAccounts()
  const { domains, isLoading: domainsLoading } = useDomains()

  useEffect(() => {
    // Check if user is already logged in
    if (isAuthenticated) {
      router.push(`/${locale}/inbox`)
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    // Set first domain as default when domains load
    if (domains.length > 0 && !selectedDomain) {
      setSelectedDomain(domains[0].name)
    }
  }, [domains, selectedDomain])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginErrors([])
    setIsLoggingIn(true)

    try {
      if (!loginEmail.trim() || !loginPassword.trim()) {
        setLoginErrors([t('errors.emailAndPasswordRequired')])
        setIsLoggingIn(false)
        return
      }

      const result = await login(loginEmail, loginPassword)

      if (result.success) {
        // Check if user is now authenticated and redirect
        if (isUserLoggedIn()) {
          router.push(`/${locale}/inbox`)
        } else {
          // If still not authenticated, try refreshing and redirect
          refreshUserData()
          setTimeout(() => {
            router.push(`/${locale}/inbox`)
          }, 100)
        }
      } else {
        setLoginErrors([result.message])
      }
    } catch (error) {
      console.error("Error during login:", error)
      setLoginErrors(["An unexpected error occurred. Please try again."])
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    setIsLoading(true)

    try {
      // Validate inputs
      const validationErrors: string[] = []

      if (!username.trim()) {
        validationErrors.push(`${t('createEmail.username')} ${t('errors.required')}`)
      }

      if (!selectedDomain) {
        validationErrors.push(t('auth.selectDomain'))
      }

      const passwordValidation = validatePassword(password)
      if (!passwordValidation.isValid) {
        validationErrors.push(...passwordValidation.errors)
      }

      if (validationErrors.length > 0) {
        setErrors(validationErrors)
        setIsLoading(false)
        return
      }

      const fullEmail = `${username}@${selectedDomain}`
      const result = await signup(fullEmail, password, displayName)

      if (result.success) {
        // Check if user is now authenticated and redirect
        if (isUserLoggedIn()) {
          router.push(`/${locale}/inbox`)
        } else {
          // If still not authenticated, try refreshing and redirect
          refreshUserData()
          setTimeout(() => {
            router.push(`/${locale}/inbox`)
          }, 100)
        }
      } else {
        setErrors([result.message])
      }
    } catch (error) {
      console.error("Error during account creation:", error)
      setErrors(["An unexpected error occurred. Please try again."])
    } finally {
      setIsLoading(false)
    }
  }

  const generatePassword = () => {
    const newPassword = generateStrongPassword()
    setPassword(newPassword)
  }

  const getFullEmail = () => {
    if (username && selectedDomain) {
      return `${username}@${selectedDomain}`
    }
    return ""
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const benefits = [
    { icon: Shield, title: t('benefits.privacy.title'), description: t('benefits.privacy.description') },
    { icon: Zap, title: t('benefits.instant.title'), description: t('benefits.instant.description') },
    { icon: Lock, title: t('benefits.secure.title'), description: t('benefits.secure.description') },
    { icon: Trash2, title: t('benefits.cleanup.title'), description: t('benefits.cleanup.description') }
  ]

  const useCases = (t as any).raw ? (t as any).raw('useCases') as string[] : []

  const features = [
    { icon: Mail, title: t('features.freeEmail.title'), description: t('features.freeEmail.description') },
    { icon: MessageSquare, title: t('features.realtime.title'), description: t('features.realtime.description') },
    { icon: Search, title: t('features.search.title'), description: t('features.search.description') },
    { icon: Filter, title: t('features.filter.title'), description: t('features.filter.description') },
    { icon: Clock, title: t('features.expire.title'), description: t('features.expire.description') },
    { icon: Shield, title: t('features.privacyFirst.title'), description: t('features.privacyFirst.description') }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header moved to layout */}
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">{t('app.title')}</h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-6 max-w-3xl mx-auto">{t('app.tagline')}</p>
            <Button 
              size="lg"
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => router.push(`/${locale}/signin`)}
            >
              {t('sections.cta.button')}
            </Button>
            <div className="text-sm text-gray-500 mt-6">{t('app.expiresNotice')}</div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('sections.benefits.title')}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('sections.benefits.subtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <benefit.icon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('sections.features.title')}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('sections.features.subtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <feature.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('sections.useCases.title')}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('sections.useCases.subtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {useCases.map((useCase, index) => (
              <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">{useCase}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('sections.howTo.title')}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('sections.howTo.subtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('howTo.step1.title')}</h3>
              <p className="text-gray-600">{t('howTo.step1.description')}</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('howTo.step2.title')}</h3>
              <p className="text-gray-600">{t('howTo.step2.description')}</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('howTo.step3.title')}</h3>
              <p className="text-gray-600">{t('howTo.step3.description')}</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('howTo.step4.title')}</h3>
              <p className="text-gray-600">{t('howTo.step4.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('sections.faq.title')}</h2>
            <p className="text-lg text-gray-600">{t('sections.faq.subtitle')}</p>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">
                {t('faq.q1.q')}
              </AccordionTrigger>
              <AccordionContent>
                {t('faq.q1.a')}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                {t('faq.q2.q')}
              </AccordionTrigger>
              <AccordionContent>
                {t('faq.q2.a')}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                {t('faq.q3.q')}
              </AccordionTrigger>
              <AccordionContent>
                {t('faq.q3.a')}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                {t('faq.q4.q')}
              </AccordionTrigger>
              <AccordionContent>
                {t('faq.q4.a')}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">
                {t('faq.q5.q')}
              </AccordionTrigger>
              <AccordionContent>
                {t('faq.q5.a')}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left">
                {t('faq.q6.q')}
              </AccordionTrigger>
              <AccordionContent>
                {t('faq.q6.a')}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{t('sections.cta.title')}</h2>
          <p className="text-xl text-blue-100 mb-8">{t('sections.cta.subtitle')}</p>
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100"
            onClick={() => router.push(`/${locale}/signup`)}
          >
            {t('sections.cta.button')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer moved to layout */}
    </div>
  )
}
