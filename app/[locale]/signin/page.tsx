"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Mail, Eye, EyeOff, Globe, Github, Apple, LogIn } from "lucide-react"
import { useUserAccounts } from "@/hooks/use-user-accounts"
import { validatePassword, isUserLoggedIn } from "@/lib/user-account-service"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useDomains } from "@/hooks/use-domains"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateStrongPassword } from "@/lib/email-service"
import { Separator } from "@/components/ui/separator"
import LanguageSwitcher from "@/components/language-switcher"

export default function SignInPage() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const [tab, setTab] = useState("login")
  const [showLoginPassword, setShowLoginPassword] = useState(false)

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
  
  const { isAuthenticated, signup, login, refreshUserData } = useUserAccounts()
  const { domains, isLoading: domainsLoading } = useDomains()

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

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-sky-200 via-sky-100 to-white" />
      <div className="relative z-10 max-w-2xl mx-auto p-4">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="text-center mb-6">
              <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-3">{t('auth.login')}</h1>
              <p className="text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">{t('app.tagline')}</p>

              {/* Auth Card */}
              <Card className="max-w-xl mx-auto mt-8 shadow-xl border border-slate-200/60 bg-white/80 backdrop-blur-md">
                <CardHeader className="text-center pb-2 space-y-2">
                  <div className="mx-auto -mt-10 mb-2 w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                    <LogIn className="h-5 w-5 text-slate-700" />
                  </div>
                  <CardTitle className="text-xl font-semibold tracking-tight">{t('auth.login')}</CardTitle>
                  <CardDescription className="text-sm text-gray-600">{t('auth.loginOrCreate')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 px-6 pb-6">
                  <Tabs value={tab} onValueChange={setTab} className="w-full">
                    <TabsList className="w-full flex mb-4">
                      <TabsTrigger value="login" className="flex-1">{t('auth.login')}</TabsTrigger>
                      <TabsTrigger value="create" className="flex-1">{t('auth.createAccount')}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                      <form onSubmit={handleLogin} className="space-y-5 text-left">
                        <div className="space-y-2">
                          <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">{t('auth.email')}</Label>
                          <div className="relative">
                            <Mail className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <Input
                              id="login-email"
                              type="email"
                              placeholder={t('auth.enterEmail')}
                              autoComplete="email"
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              className="pl-9"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">{t('auth.password')}</Label>
                          <div className="relative">
                            <Input
                              id="login-password"
                              type={showLoginPassword ? "text" : "password"}
                              placeholder={t('auth.enterPassword')}
                              autoComplete="current-password"
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              className="pr-9"
                              required
                            />
                            <button
                              type="button"
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                              aria-label={showLoginPassword ? "Hide password" : "Show password"}
                            >
                              {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          <div className="text-right">
                            <button type="button" className="text-xs text-gray-500 hover:text-gray-700">
                              Forgot password?
                            </button>
                          </div>
                        </div>

                        <Button type="submit" size="lg" className="w-full" disabled={isLoggingIn}>
                          {isLoggingIn ? t('auth.loggingIn') : t('auth.login')}
                        </Button>
                      </form>

                      {loginErrors.length > 0 && (
                        <Alert className="mt-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <ul className="list-disc list-inside">
                              {loginErrors.map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}

                      
                    </TabsContent>

                    <TabsContent value="create">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-display-name">{t('auth.displayNameOptional')}</Label>
                          <Input
                            id="signup-display-name"
                            type="text"
                            placeholder={t('auth.enterDisplayName')}
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-email">{t('auth.email')}</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="signup-username"
                              type="text"
                              placeholder={t('auth.enterUsername')}
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              className="flex-1"
                              required
                            />
                            <span className="text-gray-500">@</span>
                            <Select value={selectedDomain} onValueChange={setSelectedDomain} disabled={domainsLoading}>
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder={domainsLoading ? t('auth.loading') : t('auth.selectDomain')} />
                              </SelectTrigger>
                              <SelectContent>
                                {domains.map((domain) => (
                                  <SelectItem key={domain.id} value={domain.name}>
                                    {domain.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {getFullEmail() && (
                            <div className="text-sm text-gray-600">
                              {t('auth.fullEmail')} <span className="font-mono bg-gray-100 px-2 py-1 rounded">{getFullEmail()}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-password">{t('auth.password')}</Label>
                          <div className="flex items-center space-x-2">
                            <div className="relative flex-1">
                              <Input
                                id="signup-password"
                                type={showPassword ? "text" : "password"}
                                placeholder={t('auth.enterPassword')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pr-10"
                                required
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-500" />
                                )}
                              </Button>
                            </div>
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

                        <Button type="submit" className="w-full" disabled={isLoading || !selectedDomain}>
                          {isLoading ? t('auth.creating') : t('auth.createAccount')}
                        </Button>
                      </form>

                      {errors.length > 0 && (
                        <Alert className="mt-4">
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
                    </TabsContent>
                  </Tabs>

                  {/* Quick Access Links */}
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 mb-2">{t('auth.quickCreatePrompt')}</p>
                    <div className="flex justify-center space-x-4">
                      <Button
                        variant="link"
                        className="p-0 h-auto text-blue-600"
                        onClick={() => router.push("/create-email")}
                      >
                        {t('auth.createEmailAccount')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-sm text-gray-500">{t('app.expiresNotice')}</div>
            </div>
          </div>
        </section>
      </div>
      {/* Footer (same as main page) */}
      <footer className="bg-gray-900 text-white py-12 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('footer.aboutTitle')}</h3>
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
              <div>
                <h4 className="text-md font-semibold mb-4">{t('footer.useCasesTitle')}</h4>
                <ul className="space-y-2 text-gray-400">
                  {(t as any).raw('footer.useCases')?.map((f: string, i: number) => (<li key={i}>{f}</li>))}
                </ul>
              </div>
              <div>
                <h4 className="text-md font-semibold mb-4">{t('footer.supportTitle')}</h4>
                <ul className="space-y-2 text-gray-400">
                  {(t as any).raw('footer.support')?.map((f: string, i: number) => (<li key={i}>{f}</li>))}
                </ul>
              </div>
            </div>
            <Separator className="my-8 bg-gray-700" />
            <div className="text-center text-gray-400"><p>{t('footer.copyright')}</p></div>
          </div>
      </footer>
    </div>
  )
}


