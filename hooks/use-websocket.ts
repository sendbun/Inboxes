import { useEffect, useRef, useCallback, useState } from 'react'
import { EmailNotificationClient } from '@/lib/email-notification-client'
import { useUserAccounts } from './use-user-accounts'

interface UseWebSocketOptions {
  enabled?: boolean
  debounceMs?: number
  showNotifications?: boolean
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { enabled = true, debounceMs = 2000, showNotifications = true } = options
  const { currentAccount, isAuthenticated } = useUserAccounts()
  const clientRef = useRef<EmailNotificationClient | null>(null)
  const lastNotificationRef = useRef<string>('')
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const [newEmailCount, setNewEmailCount] = useState(0)

  // Initialize WebSocket client
  const initializeClient = useCallback(() => {
    if (!enabled || !isAuthenticated || !currentAccount) {
      return
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL
    if (!wsUrl || wsUrl === 'undefined' || wsUrl === 'null') {
      console.log('WebSocket URL not configured, skipping WebSocket initialization')
      return
    }

    try {
      // Clean up existing client
      if (clientRef.current) {
        clientRef.current.disconnect()
        clientRef.current = null
      }

      // Create new client
      clientRef.current = new EmailNotificationClient(wsUrl)
      
      // Set up connection status monitoring
      const checkConnectionStatus = () => {
        if (clientRef.current) {
          const status = clientRef.current.getConnectionStatus()
          setIsConnected(status.isConnected)
          setConnectionStatus(status.isConnected ? 'connected' : 'connecting')
          
          // If connected but not authenticated, try to authenticate
          if (status.isConnected && !status.userId && currentAccount) {
            console.log('Connected but not authenticated, forcing authentication...')
            clientRef.current.forceAuthenticate(currentAccount.id, currentAccount.email)
          }
        }
      }

      // Check status periodically
      const statusInterval = setInterval(checkConnectionStatus, 5000)
      
      // Wait for connection to be established before authenticating
      const waitForConnection = () => {
        if (clientRef.current && clientRef.current.isWebSocketAvailable()) {
          console.log('WebSocket connected, authenticating...')
          clientRef.current.forceAuthenticate(currentAccount.id, currentAccount.email)
          checkConnectionStatus()
        } else {
          // Retry after a short delay
          setTimeout(waitForConnection, 1000)
        }
      }

      // Start waiting for connection
      waitForConnection()

      return () => {
        clearInterval(statusInterval)
        if (clientRef.current) {
          clientRef.current.disconnect()
          clientRef.current = null
        }
      }
    } catch (error) {
      console.error('Failed to initialize WebSocket client:', error)
      setConnectionStatus('disconnected')
    }
  }, [enabled, isAuthenticated, currentAccount])

  // Handle new email notifications with debouncing
  const handleNewEmail = useCallback((notification: any) => {
    console.log('WebSocket: New email notification received:', notification)
    
    // Always dispatch refresh event immediately for email list update
    window.dispatchEvent(new CustomEvent('refreshEmails', { 
      detail: { notification } 
    }))
    
    // Increment new email count immediately
    setNewEmailCount(prev => prev + 1)
    
    if (!showNotifications) return

    const notificationId = `${notification.from}-${notification.subject}-${notification.timestamp}`
    
    // Prevent duplicate notifications
    if (lastNotificationRef.current === notificationId) {
      return
    }

    // Clear existing timeout
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current)
    }

    // Set new timeout for debounced notification (only for UI notifications)
    notificationTimeoutRef.current = setTimeout(() => {
      lastNotificationRef.current = notificationId
      
      // Only show browser notification if page is not focused (to avoid spam)
      if (document.hidden) {
        console.log('New email received (debounced):', notification.subject)
      }
    }, debounceMs)
  }, [showNotifications, debounceMs])

  // Initialize WebSocket when dependencies change
  useEffect(() => {
    const cleanup = initializeClient()
    return cleanup
  }, [initializeClient])

  // Set up notification handler
  useEffect(() => {
    if (!clientRef.current) {
      console.log('WebSocket: No client available for notification handler setup')
      return
    }

    console.log('WebSocket: Setting up notification handler')
    clientRef.current.onNewEmail(handleNewEmail)

    return () => {
      if (clientRef.current) {
        console.log('WebSocket: Removing notification handler')
        clientRef.current.removeNotificationCallback(handleNewEmail)
      }
    }
  }, [handleNewEmail])

  // Additional effect to ensure handler is set up when client becomes available
  useEffect(() => {
    if (clientRef.current && isConnected) {
      console.log('WebSocket: Client connected, ensuring notification handler is set up')
      clientRef.current.onNewEmail(handleNewEmail)
    }
  }, [isConnected, handleNewEmail])

  // Reset new email count when emails are loaded
  const resetNewEmailCount = useCallback(() => {
    setNewEmailCount(0)
  }, [])

  // Debug method to get detailed connection status
  const getDebugInfo = useCallback(() => {
    if (clientRef.current) {
      const status = clientRef.current.getConnectionStatus()
      return {
        ...status,
        currentAccount: currentAccount ? {
          id: currentAccount.id,
          email: currentAccount.email
        } : null,
        isAuthenticated,
        enabled
      }
    }
    return null
  }, [currentAccount, isAuthenticated, enabled])

  // Test function to manually trigger a notification
  const testNotification = useCallback(() => {
    const testNotification = {
      from: 'test@example.com',
      subject: 'Test Email',
      timestamp: Date.now(),
      id: 'test-' + Date.now()
    }
    console.log('Testing notification flow with:', testNotification)
    handleNewEmail(testNotification)
  }, [handleNewEmail])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current)
      }
      if (clientRef.current) {
        clientRef.current.disconnect()
        clientRef.current = null
      }
    }
  }, [])

  return {
    isConnected,
    connectionStatus,
    newEmailCount,
    resetNewEmailCount,
    getDebugInfo,
    testNotification,
    client: clientRef.current
  }
} 