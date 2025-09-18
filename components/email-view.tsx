"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Archive, Trash2, ArrowLeft, Send, Reply } from "lucide-react"
import { type EmailMessage } from "@/lib/email-service"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface EmailViewProps {
  email: EmailMessage
  onBack: () => void
  onForward?: (email: EmailMessage) => void
  onDelete?: (email: EmailMessage) => void
  onReply?: (email: EmailMessage) => void
}

export function EmailView({ email, onBack, onForward, onDelete, onReply }: EmailViewProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Back</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <h2 className="text-lg font-semibold truncate">{email.subject}</h2>
        </div>
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => onForward && onForward(email)} aria-label="Forward">
                  <Send className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Forward</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => onDelete && onDelete(email)} aria-label="Delete">
                  <Trash2 className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="flex items-start space-x-4">
            <Avatar>
                <AvatarFallback>{email.from.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold">{email.from}</p>
                        <p className="text-sm text-gray-500">To: {email.to}</p>
                    </div>
                    <p className="text-sm text-gray-500">{new Date(email.date).toLocaleString()}</p>
                </div>
                <Separator className="my-4"/>
                <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: email.html || email.text }}
                />
            </div>
        </div>
      </div>
      <div className="p-6 pt-0 flex space-x-4">
        <Button variant="outline" className="flex items-center space-x-2" onClick={() => onReply && onReply(email)}>
          <Reply className="h-4 w-4 mr-1" />
          <span>Reply</span>
        </Button>
        <Button variant="outline" className="flex items-center space-x-2" onClick={() => onForward && onForward(email)}>
          <Send className="h-4 w-4 mr-1" />
          <span>Forward</span>
        </Button>
      </div>
    </div>
  )
} 