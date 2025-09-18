import { useState, useEffect, useCallback } from 'react'
import { 
  getCurrentAccount, 
  getAllAccounts, 
  switchAccount, 
  removeAccount, 
  logout,
  isUserLoggedIn,
  addAccountToSession,
  createUserAccount,
  type UserAccount,
  type UserSession
} from '@/lib/user-account-service'

export function useUserAccounts() {
  const [currentAccount, setCurrentAccount] = useState<UserAccount | null>(null)
  const [allAccounts, setAllAccounts] = useState<UserAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Load user data on mount
  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = useCallback(() => {
    try {
      const authenticated = isUserLoggedIn()
      setIsAuthenticated(authenticated)

      if (authenticated) {
        const account = getCurrentAccount()
        const accounts = getAllAccounts()
        
        setCurrentAccount(account)
        setAllAccounts(accounts)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleSignup = useCallback(async (email: string, password: string, displayName?: string) => {
    try {
      // Check if account already exists
      const accounts = getAllAccounts()
      const existingAccount = accounts.find(acc => acc.email === email)
      
      if (existingAccount) {
        return { success: false, message: 'Account with this email already exists' }
      }

      // Create new account using the API
      const newAccount = await createUserAccount(email, password, displayName)
      const updatedSession = addAccountToSession(newAccount)
      
      setCurrentAccount(newAccount)
      setAllAccounts(updatedSession.accounts)
      setIsAuthenticated(true)
      
      return { success: true, message: 'Account created successfully' }
    } catch (error) {
      console.error('Error creating account:', error)
      return { success: false, message: 'Failed to create account' }
    }
  }, [])

  const handleSwitchAccount = useCallback((accountId: string) => {
    const updatedSession = switchAccount(accountId)
    if (updatedSession) {
      const newCurrentAccount = updatedSession.accounts.find(acc => acc.id === accountId)
      setCurrentAccount(newCurrentAccount || null)
      setAllAccounts(updatedSession.accounts)
      return true
    }
    return false
  }, [])

  const handleRemoveAccount = useCallback((accountId: string) => {
    const updatedSession = removeAccount(accountId)
    if (updatedSession) {
      const newCurrentAccount = updatedSession.accounts.find(acc => acc.id === updatedSession.currentAccountId)
      setCurrentAccount(newCurrentAccount || null)
      setAllAccounts(updatedSession.accounts)
      
      // If no accounts left, user is no longer authenticated
      if (updatedSession.accounts.length === 0) {
        setIsAuthenticated(false)
      }
      
      return true
    }
    return false
  }, [])

  const handleLogout = useCallback(() => {
    logout()
    setCurrentAccount(null)
    setAllAccounts([])
    setIsAuthenticated(false)
  }, [])

  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/accounts/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Create a user account object from the API response
        const accountData = data.data
        const now = new Date()
        const newAccount: UserAccount = {
          id: accountData.id?.toString(),
          email: accountData.email || email,
          password: password, // Store password for local switching
          displayName: accountData.display_name || accountData.name || email.split('@')[0],
          avatar: accountData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${email}`,
          isActive: true,
          createdAt: accountData.created_at || now.toISOString(),
          lastLoginAt: now.toISOString(),
          domain_id: accountData.domain_id || '',
          status: accountData.status ? 'active' : 'inactive',
          preferences: {
            theme: 'system',
            language: 'en',
            notifications: true
          }
        }

        // Add to session and update state
        const updatedSession = addAccountToSession(newAccount)
        setCurrentAccount(newAccount)
        setAllAccounts(updatedSession.accounts)
        setIsAuthenticated(true)
        
        // Refresh user data to ensure UI is updated
        loadUserData()
        
        return { success: true, message: 'Login successful' }
      } else {
        return { success: false, message: data.error || 'Login failed' }
      }
    } catch (error) {
      console.error('Error logging in:', error)
      return { success: false, message: 'Network error. Please try again.' }
    }
  }, [])

  const refreshUserData = useCallback(() => {
    loadUserData()
  }, [loadUserData])

  return {
    currentAccount,
    allAccounts,
    isLoading,
    isAuthenticated,
    signup: handleSignup,
    login: handleLogin,
    switchAccount: handleSwitchAccount,
    removeAccount: handleRemoveAccount,
    logout: handleLogout,
    refreshUserData
  }
} 