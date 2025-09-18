import { io, Socket } from "socket.io-client"

// WebSocket Client Class
export class EmailNotificationClient {
    private socket: Socket | null = null
    private isConnected: boolean = false
    private reconnectAttempts: number = 0
    private maxReconnectAttempts: number = 5
    private reconnectDelay: number = 1000
    private userId: string | null = null
    private userEmail: string | null = null
    private notificationCallbacks: Array<(notification: any) => void> = []
    private serverUrl: string
    private isEnabled: boolean = true

    constructor(serverUrl: string) {
        this.serverUrl = serverUrl
        // Only initialize if we have a valid server URL and it's not a REST API
        if (serverUrl && 
            serverUrl !== 'undefined' && 
            serverUrl !== 'null') {
            this.init()
        } else {
            this.isEnabled = false
        }
    }

    private init() {
        if (!this.isEnabled) return
        
        try {
            this.connect()
            this.setupEventListeners()
        } catch (error) {
            this.isEnabled = false
        }
    }

    private connect() {
        console.log('Connecting to WebSocket server:', this.serverUrl)
        if (!this.isEnabled) return
        
        try {
            console.log('Connecting to WebSocket server:', this.serverUrl)
            this.socket = io(this.serverUrl, {
                transports: ['websocket', 'polling'],
                timeout: 20000,
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: this.reconnectDelay,
                // Add error handling options
                forceNew: true,
                autoConnect: true
            })

            // Wrap the emit method to log all outgoing messages
            if (this.socket) {
                const originalEmit = this.socket.emit.bind(this.socket)
                this.socket.emit = (event: string, ...args: any[]) => {
                    return originalEmit(event, ...args)
                }
            }

            this.setupSocketEvents()
        } catch (error) {
            this.isEnabled = false
            // Don't schedule reconnect if initial connection fails
        }
    }

    private setupSocketEvents() {
        if (!this.socket || !this.isEnabled) return

        this.socket.on('connect', () => {
            console.log('WebSocket connected successfully')
            this.isConnected = true
            this.reconnectAttempts = 0
            this.reconnectDelay = 1000
            
            // Authenticate if we have user info
            if (this.userId) {
                console.log('Authenticating with userId:', this.userId)
                this.authenticate(this.userId)
            }
        })

        this.socket.on('disconnect', (reason: any) => {
            console.log('WebSocket disconnected:', reason)
            this.isConnected = false
            
            // Don't attempt to reconnect for certain disconnect reasons
            if (reason === 'io server disconnect' || reason === 'io client disconnect') {
                this.isEnabled = false
            }
        })

        this.socket.on('connect_error', (error: any) => {
            console.log('WebSocket connection error:', error)
            this.isConnected = false
            
            // Don't show error if server is not available
            if (error.message && error.message.includes('websocket')) {
                this.isEnabled = false
            }
            
            // Limit reconnection attempts
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                this.isEnabled = false
                console.log('Max reconnection attempts reached, disabling WebSocket')
            }
        })

        this.socket.on('authenticated', (data: any) => {
            console.log('Authentication successful:', data)
            if (this.userEmail) {
                console.log('Joining email room for:', this.userEmail)
                this.joinEmailRoom(this.userEmail)
            }
        })

        this.socket.on('room_joined', (data: any) => {
            console.log('Successfully joined email room:', data)
        })

        this.socket.on('new_email_notification', (notification: any) => {
            console.log('Received new email notification:', notification)
            this.handleNewEmailNotification(notification)
        })

        this.socket.on('pong', () => {
            // Connection is healthy
        })

        // Log all other events for debugging
        this.socket.onAny((eventName: any, ...args: any[]) => {
            if (!['connect', 'disconnect', 'connect_error', 'authenticated', 'room_joined', 'new_email_notification', 'pong'].includes(eventName)) {
                console.log('WebSocket event:', eventName, args)
            }
        })
    }

    private setupEventListeners() {
        if (!this.isEnabled) return
        
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && this.isConnected) {
                // Page became visible, check connection health
                this.ping()
            }
        })

        // Handle beforeunload
        window.addEventListener('beforeunload', () => {
            if (this.socket) {
                this.socket.disconnect()
            }
        })
    }

    authenticate(userId: string, token?: string) {
        if (!this.isEnabled || !this.isConnected || !this.socket) {
            console.log('Cannot authenticate: not enabled, not connected, or no socket')
            return
        }

        const authData = { userId, token }
        console.log('Sending authentication:', authData)
        
        this.userId = userId
        this.socket.emit('authenticate', authData)
    }

    joinEmailRoom(email: string) {
        if (!this.isEnabled || !this.isConnected || !this.socket) {
            console.log('Cannot join room: not enabled, not connected, or no socket')
            return
        }

        console.log('Joining email room:', email)
        this.userEmail = email
        this.socket.emit('join_email_room', email)
    }

    onNewEmail(callback: (notification: any) => void) {
        console.log('Registering new email callback, total callbacks:', this.notificationCallbacks.length)
        
        // Check if this callback is already registered to prevent duplicates
        const isAlreadyRegistered = this.notificationCallbacks.some(
            existingCallback => existingCallback === callback
        )
        
        if (!isAlreadyRegistered) {
            this.notificationCallbacks.push(callback)
            console.log('Callback registered successfully, total callbacks:', this.notificationCallbacks.length)
        } else {
            console.log('Callback already registered, skipping')
        }
    }

    // Method to clear all notification callbacks
    clearNotificationCallbacks() {
        this.notificationCallbacks = []
    }

    // Method to remove a specific callback
    removeNotificationCallback(callback: (notification: any) => void) {
        this.notificationCallbacks = this.notificationCallbacks.filter(
            existingCallback => existingCallback !== callback
        )
    }

    private handleNewEmailNotification(notification: any) {
        console.log('Handling new email notification, callbacks registered:', this.notificationCallbacks.length)
        
        // Call all registered callbacks
        this.notificationCallbacks.forEach((callback, index) => {
            try {
                console.log(`Executing callback ${index + 1}/${this.notificationCallbacks.length}`)
                callback(notification)
            } catch (error) {
                console.error('Error in notification callback:', error)
            }
        })

        // Show browser notification if permission is granted
        this.showBrowserNotification(notification)
    }

    private showBrowserNotification(notification: any) {
        if (!('Notification' in window)) {
            return
        }

        if (Notification.permission === 'granted') {
            const notificationTitle = `New Email: ${notification.subject || 'New Message'}`
            const notificationBody = `From: ${notification.from || 'Unknown sender'}`
            
            const browserNotification = new Notification(notificationTitle, {
                body: notificationBody,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: notification.uid || notification.id,
                requireInteraction: false,
                silent: false
            })

            // Handle notification click
            browserNotification.onclick = () => {
                window.focus()
                browserNotification.close()
            }

            // Auto close after 5 seconds
            setTimeout(() => {
                browserNotification.close()
            }, 5000)
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.showBrowserNotification(notification)
                }
            })
        }
    }

    ping() {
        if (this.isEnabled && this.isConnected && this.socket) {
            this.socket.emit('ping')
        }
    }

    private scheduleReconnect() {
        if (!this.isEnabled) return
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000) // Max 30 seconds
            
            setTimeout(() => {
                this.connect()
            }, this.reconnectDelay)
        } else {
            this.isEnabled = false
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect()
        }
        this.isConnected = false
        this.isEnabled = false
    }

    getConnectionStatus() {
        const status = {
            isConnected: this.isConnected,
            isEnabled: this.isEnabled,
            reconnectAttempts: this.reconnectAttempts,
            userId: this.userId,
            userEmail: this.userEmail,
            socketId: this.socket?.id || null
        }
        return status
    }

    // Method to check if WebSocket is available
    isWebSocketAvailable() {
        return this.isEnabled && this.isConnected && this.socket?.connected
    }

    // Method to manually trigger authentication and room joining
    forceAuthenticate(userId: string, email: string) {
        console.log('Force authenticating:', { userId, email })
        this.userId = userId
        this.userEmail = email
        
        if (this.isConnected && this.socket) {
            this.authenticate(userId)
            // Join room after a short delay to ensure authentication completes
            setTimeout(() => {
                this.joinEmailRoom(email)
            }, 500)
        }
    }

    private isRestApiUrl(url: string): boolean {
        // Check if URL contains the Sendbun API domain
        return url.toLowerCase().includes('uapi.sendbun.com')
    }
} 