// User account service for managing multiple email accounts in localStorage
export interface UserAccount {
  id: string
  email: string
  password: string
  displayName?: string
  avatar?: string
  isActive: boolean
  createdAt: string
  lastLoginAt: string
  domain_id?: string
  status?: string
  preferences: {
    theme: 'light' | 'dark' | 'system'
    language: string
    notifications: boolean
  }
}

export interface UserSession {
  currentAccountId: string
  accounts: UserAccount[]
  lastActivity: string
}

// Storage keys
const USER_SESSION_KEY = 'tempmail-user-session'
const ACCOUNTS_KEY = 'tempmail-accounts'

// Initialize user session
export function initializeUserSession(): UserSession {
  const existingSession = localStorage.getItem(USER_SESSION_KEY)
  
  if (existingSession) {
    try {
      return JSON.parse(existingSession)
    } catch (error) {
      console.error('Error parsing existing session:', error)
    }
  }
  
  // Create new session
  const newSession: UserSession = {
    currentAccountId: '',
    accounts: [],
    lastActivity: new Date().toISOString()
  }
  
  saveUserSession(newSession)
  return newSession
}

// Save user session to localStorage
export function saveUserSession(session: UserSession): void {
  try {
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session))
  } catch (error) {
    console.error('Error saving user session:', error)
  }
}

// Load user session from localStorage
export function loadUserSession(): UserSession | null {
  try {
    const session = localStorage.getItem(USER_SESSION_KEY)
    return session ? JSON.parse(session) : null
  } catch (error) {
    console.error('Error loading user session:', error)
    return null
  }
}

// Create a new user account using the API
export async function createUserAccount(email: string, password: string, displayName?: string): Promise<UserAccount> {
  try {
    // Call the actual account creation API
    const response = await fetch('/api/accounts/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })

    const result = await response.json()

    if (result.success) {
      // Use the API response data
      const apiData = result.data
      const now = new Date()
      
      const account: UserAccount = {
        id: apiData.id?.toString(),
        email: apiData.email || email,
        password,
        displayName: displayName || email.split('@')[0],
        avatar: generateAvatar(email),
        isActive: true,
        createdAt: now.toISOString(),
        lastLoginAt: now.toISOString(),
        domain_id: apiData.domain_id || '',
        status: apiData.status || 'active',
        preferences: {
          theme: 'system',
          language: 'en',
          notifications: true
        }
      }
      
      return account
    } else {
      throw new Error(result.error || 'Failed to create account')
    }
  } catch (error) {
    console.error('Error creating account via API:', error)
    
    // Fallback: create a mock account for demo purposes
    const now = new Date()
    const account: UserAccount = {
      id: generateAccountId(),
      email,
      password,
      displayName: displayName || email.split('@')[0],
      avatar: generateAvatar(email),
      isActive: true,
      createdAt: now.toISOString(),
      lastLoginAt: now.toISOString(),
      domain_id: 'mock',
      status: 'active',
      preferences: {
        theme: 'system',
        language: 'en',
        notifications: true
      }
    }
    
    return account
  }
}

// Add account to session
export function addAccountToSession(account: UserAccount): UserSession {
  const session = loadUserSession() || initializeUserSession()
  
  // Check if account already exists
  const existingAccountIndex = session.accounts.findIndex(acc => acc.email === account.email)
  
  if (existingAccountIndex >= 0) {
    // Update existing account
    session.accounts[existingAccountIndex] = {
      ...session.accounts[existingAccountIndex],
      ...account,
      lastLoginAt: new Date().toISOString()
    }
  } else {
    // Add new account
    session.accounts.push(account)
  }
  
  // Always set as current account when adding/updating
  session.currentAccountId = account.id
  
  session.lastActivity = new Date().toISOString()
  saveUserSession(session)
  
  return session
}

// Get current account
export function getCurrentAccount(): UserAccount | null {
  const session = loadUserSession()
  if (!session || !session.currentAccountId) return null
  
  return session.accounts.find(account => account.id === session.currentAccountId) || null
}

// Switch to different account
export function switchAccount(accountId: string): UserSession | null {
  const session = loadUserSession()
  if (!session) return null
  
  const account = session.accounts.find(acc => acc.id === accountId)
  if (!account) return null
  
  session.currentAccountId = accountId
  session.lastActivity = new Date().toISOString()
  
  // Update last login time
  const accountIndex = session.accounts.findIndex(acc => acc.id === accountId)
  if (accountIndex >= 0) {
    session.accounts[accountIndex].lastLoginAt = new Date().toISOString()
  }
  
  saveUserSession(session)
  return session
}

// Remove account from session
export function removeAccount(accountId: string): UserSession | null {
  const session = loadUserSession()
  if (!session) return null
  
  session.accounts = session.accounts.filter(account => account.id !== accountId)
  
  // If we removed the current account, switch to another one
  if (session.currentAccountId === accountId) {
    session.currentAccountId = session.accounts.length > 0 ? session.accounts[0].id : ''
  }
  
  session.lastActivity = new Date().toISOString()
  saveUserSession(session)
  
  return session
}

// Update account preferences
export function updateAccountPreferences(accountId: string, preferences: Partial<UserAccount['preferences']>): UserSession | null {
  const session = loadUserSession()
  if (!session) return null
  
  const accountIndex = session.accounts.findIndex(account => account.id === accountId)
  if (accountIndex === -1) return null
  
  session.accounts[accountIndex].preferences = {
    ...session.accounts[accountIndex].preferences,
    ...preferences
  }
  
  session.lastActivity = new Date().toISOString()
  saveUserSession(session)
  
  return session
}

// Update account display name
export function updateAccountDisplayName(accountId: string, displayName: string): UserSession | null {
  const session = loadUserSession()
  if (!session) return null
  
  const accountIndex = session.accounts.findIndex(account => account.id === accountId)
  if (accountIndex === -1) return null
  
  session.accounts[accountIndex].displayName = displayName
  session.lastActivity = new Date().toISOString()
  saveUserSession(session)
  
  return session
}

// Get all accounts
export function getAllAccounts(): UserAccount[] {
  const session = loadUserSession()
  return session?.accounts || []
}

// Check if user is logged in
export function isUserLoggedIn(): boolean {
  const session = loadUserSession()
  return !!(session && session.currentAccountId && session.accounts.length > 0)
}

// Logout (clear current account but keep accounts in storage)
export function logout(): void {
  const session = loadUserSession()
  if (session) {
    session.currentAccountId = ''
    session.lastActivity = new Date().toISOString()
    saveUserSession(session)
  }
}

// Clear all data
export function clearAllData(): void {
  localStorage.removeItem(USER_SESSION_KEY)
  localStorage.removeItem(ACCOUNTS_KEY)
}

// Generate unique account ID
function generateAccountId(): string {
  return `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Generate avatar initials from email
function generateAvatar(email: string): string {
  const name = email.split('@')[0]
  return name.substring(0, 2).toUpperCase()
}

// Validate email format
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate password strength
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
} 