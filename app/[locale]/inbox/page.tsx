"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Search,
  Archive,
  Trash2,
  RotateCcw,
  AlertTriangle,
  Mail,
  Edit,
  Inbox,
  Send,
  FileText,
  Plus,
  UserMinus,
  LogOut,
  ChevronDown,
  CheckSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Copy,
  Eye,
  EyeOff,
  Wifi,
  WifiOff,
} from "lucide-react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useUserAccounts } from "@/hooks/use-user-accounts"
import { useWebSocket } from "@/hooks/use-websocket"
import { ComposePopup } from "@/components/compose-popup"
import { EmailView } from "@/components/email-view"
import { fetchEmails, fetchEmailById, searchEmails, type EmailMessage, type EmailPagination } from "@/lib/email-service"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AccountPopup } from "@/components/AccountPopup"
import Image from "next/image"

// Utility to format bytes to human readable string
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function InboxPage() {
  const router = useRouter()
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { 
    currentAccount, 
    allAccounts, 
    isLoading: isUserLoading, 
    isAuthenticated, 
    switchAccount, 
    removeAccount, 
    logout 
  } = useUserAccounts()
  
  // WebSocket integration
  const { isConnected, connectionStatus, newEmailCount, resetNewEmailCount, getDebugInfo, testNotification } = useWebSocket({
    enabled: true,
    debounceMs: 3000, // 3 second debounce to prevent spam
    showNotifications: true
  })
  
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [emails, setEmails] = useState<EmailMessage[]>([])
  const [pagination, setPagination] = useState<EmailPagination | null>(null)
  const [isEmailsLoading, setIsEmailsLoading] = useState(true)
  const [activeFolder, setActiveFolder] = useState('inbox')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null)
  const [accountInfo, setAccountInfo] = useState<any>(null)
  const [mailboxInfo, setMailboxInfo] = useState<any>(null)
  const [isAccountInfoLoading, setIsAccountInfoLoading] = useState(false)
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [forwardData, setForwardData] = useState<{subject: string, message: string} | null>(null)
  const [isAccountPopupOpen, setIsAccountPopupOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const loadEmails = useCallback(async () => {
    if (!currentAccount) return

    setIsEmailsLoading(true)
    try {
      const folderFilter = activeFolder === 'inbox' ? 'inbox' : activeFolder
      const response = await fetchEmails(currentAccount.id, currentPage, folderFilter)
      if (response) {
        setEmails(response.messages)
        setPagination(response.pagination)
        // Reset new email count when emails are loaded
        resetNewEmailCount()
      } else {
        setEmails([])
        setPagination(null)
      }
    } catch (error) {
      console.error("Failed to fetch emails:", error)
      setEmails([])
      setPagination(null)
    } finally {
      setIsEmailsLoading(false)
    }
  }, [currentAccount, activeFolder, currentPage, resetNewEmailCount])

  // Handle WebSocket refresh events
  useEffect(() => {
    const handleRefreshEmails = (event: Event) => {
      const customEvent = event as CustomEvent
      console.log('Inbox: Received refreshEmails event:', customEvent.detail)
      
      // Show a toast notification for new emails
      if (customEvent.detail?.notification) {
        const notification = customEvent.detail.notification
        toast.success('New Email Received', {
          description: `${notification.subject || 'New message'} from ${notification.from || 'Unknown sender'}`,
          duration: 3000
        })
      }
      
      // Always refresh emails when we receive a WebSocket notification
      // Only skip if we're currently loading to avoid conflicts
      if (!isEmailsLoading && !isSearching) {
        console.log('Inbox: Refreshing emails due to WebSocket notification')
        loadEmails()
      } else {
        console.log('Inbox: Skipping refresh - currently loading or searching')
      }
    }

    window.addEventListener('refreshEmails', handleRefreshEmails)
    return () => {
      window.removeEventListener('refreshEmails', handleRefreshEmails)
    }
  }, [loadEmails, isEmailsLoading, isSearching])

  const performSearch = useCallback(async () => {
    if (!currentAccount || !searchQuery.trim()) {
      loadEmails()
      return
    }

    setIsSearching(true)
    try {
      const response = await searchEmails(currentAccount.id, {
        query: searchQuery.trim(),
        folder: activeFolder,
        page: currentPage,
        limit: 20
      })
      if (response) {
        setEmails(response.messages)
        setPagination(response.pagination)
      } else {
        setEmails([])
        setPagination(null)
      }
    } catch (error) {
      console.error("Failed to search emails:", error)
      setEmails([])
      setPagination(null)
    } finally {
      setIsSearching(false)
    }
  }, [currentAccount, searchQuery, activeFolder, currentPage, loadEmails])

  useEffect(() => {
    if (!isUserLoading && !isAuthenticated) {
      router.push("/")
    } else if (currentAccount) {
      loadEmails()
    }
  }, [isUserLoading, isAuthenticated, currentAccount, loadEmails, router])

  // Debounced search effect
  useEffect(() => {
    if (!currentAccount) return

    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch()
      } else {
        loadEmails()
      }
    }, 500) // 500ms delay

    return () => clearTimeout(timeoutId)
  }, [searchQuery, currentAccount, activeFolder, currentPage])
  
  const handleSelectEmail = async (emailId: string) => {
    if(!currentAccount) return
    setIsEmailsLoading(true)
    try {
        const email = await fetchEmailById(currentAccount.id, emailId)
        if (!email) {
          toast("Error: Email not found.")
          setSelectedEmail(null)
          return
        }
        setSelectedEmail(email)
        router.push(`?email=${emailId}`)
    } catch (error) {
        console.error("Failed to fetch email:", error)
        toast("Error: Could not fetch email details.")
    } finally {
        setIsEmailsLoading(false)
    }
  }

  useEffect(() => {
    const emailId = searchParams.get('email');
    if (emailId && currentAccount) {
      handleSelectEmail(emailId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAccount])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleSwitchAccount = (accountId: string) => {
    switchAccount(accountId)
    setCurrentPage(1)
    setSelectedEmail(null)
  }

  const handleRemoveAccount = (accountId: string) => {
    const success = removeAccount(accountId)
    if (success && allAccounts.length <= 1) {
      router.push("/")
    }
  }

  const handleAddAccount = () => {
    setIsAccountPopupOpen(true)
  }

  const handleFolderChange = (folder: string) => {
    setActiveFolder(folder)
    setCurrentPage(1)
    setSelectedEmail(null)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && (!pagination || newPage <= pagination.total_pages)) {
      setCurrentPage(newPage)
    }
  }

  const handleCopyEmail = () => {
    if (currentAccount?.email) {
      navigator.clipboard.writeText(currentAccount.email)
      toast("Copied!", { description: "Email address copied to clipboard." })
    }
  }

  const handleCopyPassword = () => {
    if (currentAccount?.password) {
      navigator.clipboard.writeText(currentAccount.password)
      toast("Copied!", { description: "Password copied to clipboard." })
    }
  }

  const handleTogglePassword = () => {
    setShowPassword(!showPassword)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch()
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const sidebarItems = [
    { name: 'inbox', icon: Inbox, label: "Inbox" },
    { name: 'sent', icon: Send, label: "Sent" },
    { name: 'drafts', icon: FileText, label: "Drafts" },
    { name: 'spam', icon: AlertTriangle, label: "Spam" },
    { name: 'trash', icon: Trash2, label: "Trash" },
  ]

  // Fetch account info when currentAccount changes
  useEffect(() => {
    const fetchAccountInfo = async () => {
      if (!currentAccount?.id) return
      setIsAccountInfoLoading(true)
      try {
        const res = await fetch(`/api/accounts/${currentAccount.id}/info`)
        const data = await res.json()
        if (data.account) setAccountInfo(data.account)
        if (data.mailbox) setMailboxInfo(data.mailbox)
      } catch (e) {
        setAccountInfo(null)
        setMailboxInfo(null)
      } finally {
        setIsAccountInfoLoading(false)
      }
    }
    fetchAccountInfo()
  }, [currentAccount?.id])

  // Select all logic
  const allSelected = emails.length > 0 && selectedEmails.length === emails.length
  const isIndeterminate = selectedEmails.length > 0 && selectedEmails.length < emails.length

  const handleSelectEmailCheckbox = (emailId: string) => {
    setSelectedEmails((prev) =>
      prev.includes(emailId) ? prev.filter((id) => id !== emailId) : [...prev, emailId]
    )
  }

  const handleSelectAll = () => {
    if (allSelected) setSelectedEmails([])
    else setSelectedEmails(emails.map((e) => e.id))
  }

  // Delete API call for selected emails
  const handleDeleteSelected = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!currentAccount || selectedEmails.length === 0) return
    try {
      // Call the new delete-multiple API endpoint
      const res = await fetch(`/api/emails/${currentAccount.id}/delete-multiple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedEmails })
      })
      const data = await res.json()
      if (data.success) {
        setSelectedEmails([])
        loadEmails()
        toast("Deleted", { description: data.data?.message || "Selected emails deleted." })
      } else {
        toast("Error", { description: data.error || "Failed to delete emails." })
      }
    } catch (err) {
      toast("Error: Failed to delete emails.")
    }
  }

  const handleForwardEmail = (email: EmailMessage) => {
    setForwardData({
      subject: `Fwd: ${email.subject}`,
      message: `<div>---------- Forwarded message ----------<br/>From: ${email.from}<br/>Date: ${new Date(email.date).toLocaleString()}<br/>Subject: ${email.subject}<br/>To: ${email.to}<br/><br/>${email.html || email.text}</div>`
    })
    setIsComposeOpen(true)
  }

  const handleReplyEmail = (email: EmailMessage) => {
    setForwardData({
      subject: `Re: ${email.subject}`,
      message: `<div><br/><br/>On ${new Date(email.date).toLocaleString()}, ${email.from} wrote:<blockquote>${email.html || email.text}</blockquote></div>`
    })
    setIsComposeOpen(true)
  }

  const handleDeleteEmail = async (email: EmailMessage) => {
    if (!currentAccount) return
    try {
      await fetch(`/api/emails/${currentAccount.id}/${email.id}/delete`, { method: 'DELETE' })
      setSelectedEmail(null)
      loadEmails()
      toast("Deleted", { description: "Email deleted." })
    } catch (err) {
      toast("Error: Failed to delete email.")
    }
  }

  // Debug function to log WebSocket status
  const debugWebSocket = () => {
    const debugInfo = getDebugInfo()
    console.log('WebSocket Debug Info:', debugInfo)
    if (debugInfo) {
      toast.info('WebSocket Debug Info', {
        description: `Connected: ${debugInfo.isConnected}, User: ${debugInfo.userId}, Email: ${debugInfo.userEmail}`
      })
    }
  }

  // Test notification function
  const testNewEmailNotification = () => {
    console.log('Testing new email notification...')
    testNotification()
  }

  if (isUserLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4" />
          <p>Loading user...</p>
        </div>
      </div>
    )
  }

  if (!currentAccount) {
    return null
  }
  
  const renderEmailList = () => (
    <>
      <div className="flex items-center justify-between p-2 border-b bg-gray-50">
        <div className="flex items-center space-x-2 p-2">
          <input
            type="checkbox"
            checked={allSelected}
            ref={el => { if (el) el.indeterminate = isIndeterminate }}
            onChange={handleSelectAll}
            className="accent-blue-600 h-4 w-4 rounded border-gray-300 focus:ring-0"
            aria-label="Select all emails"
          />
          <Button variant="ghost" size="sm" onClick={loadEmails} disabled={isEmailsLoading} aria-label="Refresh">
            <RotateCcw className={`h-4 w-4 ${isEmailsLoading ? 'animate-spin' : ''}`} />
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleDeleteSelected} disabled={selectedEmails.length === 0} aria-label="Delete selected emails">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete selected</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {pagination && pagination.total_items > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>
              {(pagination.current_page - 1) * pagination.items_per_page + 1}-
              {Math.min(pagination.current_page * pagination.items_per_page, pagination.total_items)} of {pagination.total_items}
            </span>
            <Button variant="ghost" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={!pagination || currentPage === pagination.total_pages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {isEmailsLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
          </div>
        ) : emails?.length > 0 ? (
          <ul>
            {emails.map((email) => {
              const isChecked = selectedEmails.includes(email.id)
              const isRead = email.folder === 'sent' ? true : (email.read || email.is_seen === '1');
              return (
                <li
                  key={email.id}
                  className={`group border-b hover:bg-gray-50 cursor-pointer transition-colors ${isRead ? 'bg-white text-gray-700 font-normal' : 'bg-blue-50 font-semibold text-black'}`}
                  onClick={() => handleSelectEmail(email.id)}
                >
                  <div className="flex items-center p-3 relative w-full">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={e => { e.stopPropagation(); handleSelectEmailCheckbox(email.id) }}
                      onClick={e => e.stopPropagation()}
                      className="accent-blue-600 h-4 w-4 rounded border-gray-300 focus:ring-0 mr-3"
                      aria-label="Select email"
                      tabIndex={0}
                    />
                    {/* Sender */}
                    <span className="font-semibold text-sm truncate mr-4 w-40 flex-shrink-0">{email.from}</span>
                    {/* Subject and preview */}
                    <div className="flex-1 min-w-0 flex items-center">
                      <span className="font-medium text-sm truncate max-w-xs md:max-w-md lg:max-w-lg">{email.subject}</span>
                      <span className="text-gray-500 text-sm truncate ml-1 max-w-xs md:max-w-md lg:max-w-lg">- {email.text}</span>
                    </div>
                    {/* Date/time */}
                    <div className="text-xs text-gray-500 whitespace-nowrap ml-4 flex-shrink-0">
                      {new Date(email.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {/* Delete icon (show on hover or if checked) */}
                    <div className={`absolute right-3 flex items-center space-x-2 transition-opacity bg-white ${isChecked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="text-gray-400 hover:text-red-600 focus:outline-none"
                              tabIndex={0}
                              aria-label="Delete"
                              onClick={e => { e.stopPropagation(); setSelectedEmails([email.id]); handleDeleteSelected(e); }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="text-center text-gray-500 p-8">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No emails in {activeFolder}</h3>
            <p className="text-sm">
              Emails in this folder will appear here.
            </p>
          </div>
        )}
      </div>
      {/* Floating delete button for multi-select */}
      {selectedEmails.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="destructive" size="lg" onClick={handleDeleteSelected} className="shadow-lg">
                  <Trash2 className="h-5 w-5 mr-2" /> Delete Selected
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete selected emails</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </>
  )

  return (
    <>
      <div className="h-screen flex flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
           {/* Header content... */}
           <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <Image src="/logo.png" alt="TempMail" width={118} height={48} />
                    {/* WebSocket Status Indicator */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center space-x-1">
                            {isConnected ? (
                              <Wifi className="h-4 w-4 text-green-500" />
                            ) : connectionStatus === 'connecting' ? (
                              <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
                            ) : (
                              <WifiOff className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {isConnected 
                            ? "Real-time notifications connected" 
                            : connectionStatus === 'connecting' 
                            ? "Connecting to real-time notifications..." 
                            : "Real-time notifications disconnected"
                          }
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {/* Debug Button */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={debugWebSocket}
                            className="h-6 w-6 p-0"
                          >
                            <Settings className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Debug WebSocket</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {/* Test Notification Button */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={testNewEmailNotification}
                            className="h-6 w-6 p-0"
                          >
                            <Mail className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Test Notification</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
            <div className="flex-1 max-w-2xl mx-8">
                <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                        placeholder="Search mail" 
                        className="pl-10 bg-gray-100 border-0" 
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        disabled={isSearching}
                    />
                    {isSearching && (
                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />
                    )}
                </form>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-blue-600 text-white">
                                {currentAccount.avatar || currentAccount.email.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <span className="hidden md:block text-sm font-medium">
                            {currentAccount.displayName || currentAccount.email.split('@')[0]}
                        </span>
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                    <div className="p-4">
                        <div className="text-sm text-gray-600">You are signed in as</div>
                        <div className="font-medium flex items-center justify-between">
                          <span>{currentAccount.email}</span>
                          <Button variant="ghost" size="sm" onClick={handleCopyEmail}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                            <div className="flex items-center justify-between">
                              <span>Password:</span>
                              <div className="flex items-center space-x-1">
                                <span className="font-mono text-xs">
                                  {showPassword ? currentAccount.password : '••••••••'}
                                </span>
                                <Button variant="ghost" size="sm" onClick={handleTogglePassword}>
                                  {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={handleCopyPassword}>
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            Last login: {new Date(currentAccount.lastLoginAt).toLocaleDateString()}
                        </div>
                    </div>
                    <DropdownMenuSeparator />
                    
                    {allAccounts.filter(acc => acc.id !== currentAccount.id).map((account) => (
                    <DropdownMenuItem 
                        key={account.id} 
                        className="flex items-center space-x-3 p-3"
                        onClick={() => handleSwitchAccount(account.id)}
                    >
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-purple-600 text-white">
                                {account.avatar || account.email.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="font-medium">{account.displayName || account.email.split('@')[0]}</div>
                            <div className="text-xs text-gray-500">{account.email}</div>
                        </div>
                    </DropdownMenuItem>
                    ))}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-center space-x-2" onClick={handleAddAccount}>
                        <Plus className="h-4 w-4" />
                        <span>Add another account</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center space-x-2">
                        <Settings className="h-4 w-4" />
                        <span>Account settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        className="flex items-center space-x-2 text-red-600"
                        onClick={() => handleRemoveAccount(currentAccount.id)}
                    >
                        <UserMinus className="h-4 w-4" />
                        <span>Remove this account</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center space-x-2">
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 min-w-64 max-w-64 bg-gray-50 border-r flex flex-col overflow-y-auto">
            <div className="p-4 space-y-2">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setIsComposeOpen(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Compose
              </Button>
            </div>

            <nav className="flex-1 px-2">
              {sidebarItems.map((item) => (
                <div
                  key={item.name}
                  onClick={() => handleFolderChange(item.name)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg mb-1 cursor-pointer ${
                    activeFolder === item.name ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  {/* Show notification badge for inbox when new emails arrive */}
                  {item.name === 'inbox' && newEmailCount > 0 && (
                    <Badge variant="destructive" className="h-5 w-5 p-0 text-xs flex items-center justify-center">
                      {newEmailCount > 9 ? '9+' : newEmailCount}
                    </Badge>
                  )}
                </div>
              ))}
            </nav>

            <div className="p-4 border-t mt-auto">
              <div className="text-xs text-gray-500 mb-2">Account Info</div>
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-4 text-white relative">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium">
                    {currentAccount.displayName || currentAccount.email.split('@')[0]}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20" onClick={handleCopyEmail}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs opacity-90 break-all mb-1">{currentAccount.email}</div>
                <div className="flex items-center mb-2">
                  <Avatar className="h-7 w-7 mr-2">
                    <AvatarFallback>{(currentAccount.displayName || currentAccount.email.charAt(0)).charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs opacity-75">Created: {new Date(currentAccount.createdAt).toLocaleDateString()}</span>
                </div>
                {/* Storage Progress Bar */}
                {isAccountInfoLoading ? (
                  <div className="text-xs text-white/80">Loading storage...</div>
                ) : accountInfo && mailboxInfo ? (
                  <>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Storage</span>
                      <span>{formatBytes(Number(mailboxInfo.total_size))} / {accountInfo.assigned_memory ? formatBytes(Number(accountInfo.assigned_memory) * 1024 * 1024) : 'N/A'}</span>
                    </div>
                    <Progress value={
                      accountInfo.assigned_memory ? Math.min(100, Math.round((parseInt(mailboxInfo.total_size) / (parseInt(accountInfo.assigned_memory) * 1024 * 1024)) * 100)) : 0
                    } className="h-2 bg-white/30" />
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {selectedEmail ? (
                <EmailView 
                  email={selectedEmail} 
                  onBack={() => {
                    setSelectedEmail(null);
                    router.push(pathname);
                  }} 
                  onForward={handleForwardEmail}
                  onDelete={handleDeleteEmail}
                  onReply={handleReplyEmail}
                />
            ) : (
                renderEmailList()
            )}
          </div>
        </div>
      </div>
      <ComposePopup 
        open={isComposeOpen}
        onOpenChange={(open) => {
          setIsComposeOpen(open)
          if (!open) setForwardData(null)
        }}
        onSend={loadEmails}
        initialSubject={forwardData?.subject}
        initialMessage={forwardData?.message}
      />
      <AccountPopup open={isAccountPopupOpen} onOpenChange={setIsAccountPopupOpen} />
    </>
  )
}
