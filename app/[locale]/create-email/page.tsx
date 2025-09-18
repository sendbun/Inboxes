"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from 'next-intl'
import { useUserAccounts } from "@/hooks/use-user-accounts"
import { useDomains } from "@/hooks/use-domains"
import { generateStrongPassword } from "@/lib/email-service"
import { DomainSelector } from "@/components/domain-selector"
import { createUserAccount, addAccountToSession } from "@/lib/user-account-service"

export default function CreateEmailPage() {
  const locale = useLocale()
  const t = useTranslations()
  const [username, setUsername] = useState("")
  const [selectedDomain, setSelectedDomain] = useState("")
  const [password, setPassword] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [success, setSuccess] = useState<string>("")
  const router = useRouter()
  const { currentAccount, isAuthenticated, refreshUserData } = useUserAccounts()
  const { domains, isLoading } = useDomains()

  useEffect(() => {
    // Check if user is logged in
    if (!isAuthenticated) {
      router.push(`/${locale}`)
      return
    }

    // Set first domain as default when domains load
    if (domains.length > 0 && !selectedDomain) {
      setSelectedDomain(domains[0].name)
    }
  }, [isAuthenticated, router, domains, selectedDomain])

  const generatePassword = () => {
    const newPassword = generateStrongPassword()
    setPassword(newPassword)
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    setSuccess("")
    setIsCreating(true)

    try {
      // Validate inputs
      const validationErrors: string[] = []

      if (!username.trim()) {
        validationErrors.push(`${t('createEmail.username')} ${t('errors.required')}`)
      }

      if (!selectedDomain) {
        validationErrors.push(t('createEmail.selectDomain'))
      }

      if (!password) {
        validationErrors.push(`${t('auth.password')} ${t('errors.required')}`)
      }

      if (validationErrors.length > 0) {
        setErrors(validationErrors)
        setIsCreating(false)
        return
      }

      const email = `${username}@${selectedDomain}`

      // Create account using the user account service (which calls the API)
      const newAccount = await createUserAccount(email, password, username)
      
      // Add to session
      addAccountToSession(newAccount)
      
      // Refresh user data
      refreshUserData()
      
      setSuccess(t('createEmail.success', {email}))
      
      // Redirect to inbox after a short delay
      setTimeout(() => {
        router.push(`/${locale}/inbox`)
      }, 1500)
      
    } catch (error) {
      console.error("Error creating email account:", error)
      setErrors(["An unexpected error occurred. Please try again."])
    } finally {
      setIsCreating(false)
    }
  }

  const getFullEmail = () => {
    if (username && selectedDomain) {
      return `${username}@${selectedDomain}`
    }
    return ""
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>{t('createEmail.loadingDomains')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push(`/${locale}/inbox`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('createEmail.backToInbox')}
              </Button>
              <div>
                <CardTitle className="text-2xl font-bold">{t('createEmail.title')}</CardTitle>
                <CardDescription>{t('createEmail.subtitle')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Domain Selection */}
            <DomainSelector
              selectedDomain={selectedDomain}
              onDomainSelect={setSelectedDomain}
            />

            {/* Email Creation Form */}
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t('createEmail.username')}</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="username"
                    type="text"
                    placeholder={t('createEmail.enterUsername')}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="flex-1"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                  />
                  <span className="text-gray-500">@</span>
                  <div className="flex-1 p-2 bg-gray-100 border rounded-md">
                    <span className="text-gray-700">{selectedDomain || t('createEmail.selectDomain')}</span>
                  </div>
                </div>
                {getFullEmail() && (
                  <div className="text-sm text-gray-600">
                    {t('auth.fullEmail')} <span className="font-mono bg-gray-100 px-2 py-1 rounded">{getFullEmail()}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('createEmail.enterPassword')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generatePassword}
                    className="whitespace-nowrap"
                  >
                    {t('auth.generate')}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">{t('auth.passwordRequirements')}</p>
              </div>

              <Button type="submit" className="w-full" disabled={isCreating || !selectedDomain}>
                {isCreating ? t('auth.creating') : t('auth.createEmailAccount')}
              </Button>
            </form>

            {/* Success Message */}
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {/* Error Messages */}
            {errors.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Current User Info */}
            {currentAccount && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">{t('createEmail.currentUserAccount')}</div>
                <div className="font-medium">{currentAccount.email}</div>
                <div className="text-sm text-gray-500">
                  {currentAccount.displayName || currentAccount.email.split('@')[0]}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 