"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Send, Paperclip, ImageIcon, Link, Trash2, X, Expand, Minus, ArrowLeft } from "lucide-react"
import { useUserAccounts } from "@/hooks/use-user-accounts"
import { useIsMobile } from "@/hooks/use-mobile"
import { toast } from "sonner"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, Underline, List, ListOrdered, Undo2, Redo2 } from 'lucide-react'
import UnderlineExtension from '@tiptap/extension-underline'
import { ReactMultiEmail, isEmail } from 'react-multi-email'
import 'react-multi-email/dist/style.css'
import Image from '@tiptap/extension-image'

interface ComposePopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSend: () => void
  initialSubject?: string
  initialMessage?: string
}

export function ComposePopup({ open, onOpenChange, onSend, initialSubject = '', initialMessage = '' }: ComposePopupProps) {
  const [recipients, setRecipients] = useState<string[]>([])
  const [subject, setSubject] = useState(initialSubject)
  const [message, setMessage] = useState(initialMessage) // HTML string
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const { currentAccount } = useUserAccounts()
  const isMobile = useIsMobile()
  const popupRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      Image,
    ],
    content: message,
    onUpdate: ({ editor }) => {
      setMessage(editor.getHTML())
    },
  })

  useEffect(() => {
    if (open && editor && initialMessage !== undefined) {
      editor.commands.setContent(initialMessage)
    }
  }, [open, initialMessage, editor])

  const handleSend = async () => {
    if (!currentAccount?.id) return
    setIsSending(true)
    try {
      // Utility to strip HTML tags for plain text
      const stripHtml = (html: string) => html.replace(/<[^>]+>/g, "").replace(/\s+/g, ' ').trim();
      const payload = {
        Source: currentAccount.email,
        Destination: {
          ToAddresses: recipients,
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: "UTF-8"
          },
          Body: {
            Text: {
              Data: stripHtml(message),
              Charset: "UTF-8"
            },
            Html: {
              Data: message,
              Charset: "UTF-8"
            }
          }
        }
      }
      const res = await fetch(`/api/accounts/${currentAccount.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Email sent successfully!")
        onSend()
        onOpenChange(false)
        setRecipients([])
        setSubject("")
        setMessage("")
      } else {
        toast.error(data.error || "Failed to send email")
      }
    } catch (e) {
      toast.error("Failed to send email")
    } finally {
      setIsSending(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const editorHeightClass = "flex-1 min-h-0"

  const popupTitle = subject && /^(Fwd:|Re:)/i.test(subject) ? subject : 'New Message';

  if (!open) {
    return null
  }
  
  if (isMobile) {
    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                 <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={handleClose}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h2 className="text-lg font-semibold">{popupTitle}</h2>
                 </div>
                 <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon"><Paperclip className="h-5 w-5" /></Button>
                    <Button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700 text-sm" disabled={isSending}>Send</Button>
                 </div>
            </div>
            <div className="p-4 space-y-4 flex-1 flex flex-col">
                <div className="flex items-center space-x-2">
                    <span className="text-gray-500">From</span>
                    <span className="text-sm">{currentAccount?.email || ''}</span>
                </div>
                <Separator/>
                <div className="flex items-center space-x-2">
                    <label htmlFor="to" className="text-gray-500">To</label>
                    <ReactMultiEmail
                      placeholder="Recipients"
                      emails={recipients}
                      onChange={setRecipients}
                      validateEmail={email => isEmail(email)}
                      getLabel={(email, index, removeEmail) => (
                        <div data-tag key={index}>
                          {email}
                          <span data-tag-handle onClick={() => removeEmail(index)}>
                            ×
                          </span>
                        </div>
                      )}
                      className="w-full !border-0 !border-b !rounded-none p-1 bg-white text-sm"
                    />
                </div>
                <Separator/>
                <Input id="subject" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full border-none p-0 h-auto text-sm focus-visible:ring-0" />
                <Separator/>
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center space-x-2 border-b pb-2 mb-2">
                    <Button type="button" variant="ghost" size="icon" onClick={() => editor?.chain().focus().toggleBold().run()} disabled={!editor} aria-label="Bold"><Bold className={editor?.isActive('bold') ? 'text-blue-600' : ''} /></Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => editor?.chain().focus().toggleItalic().run()} disabled={!editor} aria-label="Italic"><Italic className={editor?.isActive('italic') ? 'text-blue-600' : ''} /></Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => editor?.chain().focus().toggleUnderline().run()} disabled={!editor} aria-label="Underline"><Underline className={editor?.isActive('underline') ? 'text-blue-600' : ''} /></Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => editor?.chain().focus().toggleBulletList().run()} disabled={!editor} aria-label="Bullet List"><List className={editor?.isActive('bulletList') ? 'text-blue-600' : ''} /></Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => editor?.chain().focus().toggleOrderedList().run()} disabled={!editor} aria-label="Ordered List"><ListOrdered className={editor?.isActive('orderedList') ? 'text-blue-600' : ''} /></Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => editor?.chain().focus().undo().run()} disabled={!editor} aria-label="Undo"><Undo2 /></Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => editor?.chain().focus().redo().run()} disabled={!editor} aria-label="Redo"><Redo2 /></Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => {
                      const url = window.prompt('Enter image URL')
                      if (url && editor) {
                        // @ts-ignore
                        editor.chain().focus().setImage({ src: url }).run()
                      }
                    }} disabled={!editor} aria-label="Insert Image">
                      <ImageIcon className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="flex-1 min-h-[150px]">
                    <EditorContent editor={editor} className={`tiptap-editor h-full w-full p-2 text-base bg-white focus:outline-none focus:border-none overflow-y-auto ${editorHeightClass}`} />
                  </div>
                </div>
            </div>
        </div>
    )
  }

  const popupClasses = [
    "fixed", "bottom-0", "bg-white", "rounded-t-lg", "shadow-2xl", "flex", "flex-col", "transition-all", "duration-300", "ease-in-out", "z-40",
    isMinimized
      ? "h-[48px] w-[400px] right-20" // Only header height and a reasonable width
      : isExpanded
        ? "w-[80vw] max-w-[1000px] h-[85vh] right-1/2 translate-x-1/2"
        : "w-[600px] h-[500px] right-20",
  ].join(" ")

  return (
    <div ref={popupRef} className={popupClasses}>
      <div className="flex items-center justify-between p-2 px-4 bg-gray-800 text-white rounded-t-lg h-[48px]">
        <h2 className="text-sm font-medium">{popupTitle}</h2>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-gray-700" onClick={toggleMinimize}>
            <Minus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-gray-700" onClick={toggleExpand}>
            <Expand className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-gray-700" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {!isMinimized && (
        <div className="flex flex-col flex-1 min-h-0 h-0">
          <div className="px-4 pt-4">
            <ReactMultiEmail
              placeholder="Recipients"
              emails={recipients}
              onChange={setRecipients}
              validateEmail={email => isEmail(email)}
              getLabel={(email, index, removeEmail) => (
                <div data-tag key={index}>
                  {email}
                  <span data-tag-handle onClick={() => removeEmail(index)}>
                    ×
                  </span>
                </div>
              )}
              className="w-full !border-0 !border-b !rounded-none p-1 bg-white text-sm"
            />
          </div>
          <div className="px-4">
            <Input id="subject" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full border-0 border-b rounded-none focus-visible:ring-0 focus:border-blue-500 p-1"/>
          </div>
          <div className="flex-1 min-h-0 p-4 flex flex-col">
            <div className="flex items-center space-x-2 border-b pb-2 mb-2">
              <Button type="button" variant="ghost" size="icon" onClick={() => editor?.chain().focus().toggleBold().run()} disabled={!editor} aria-label="Bold"><Bold className={editor?.isActive('bold') ? 'text-blue-600' : ''} /></Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => editor?.chain().focus().toggleItalic().run()} disabled={!editor} aria-label="Italic"><Italic className={editor?.isActive('italic') ? 'text-blue-600' : ''} /></Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => editor?.chain().focus().toggleUnderline().run()} disabled={!editor} aria-label="Underline"><Underline className={editor?.isActive('underline') ? 'text-blue-600' : ''} /></Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => editor?.chain().focus().toggleBulletList().run()} disabled={!editor} aria-label="Bullet List"><List className={editor?.isActive('bulletList') ? 'text-blue-600' : ''} /></Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => editor?.chain().focus().toggleOrderedList().run()} disabled={!editor} aria-label="Ordered List"><ListOrdered className={editor?.isActive('orderedList') ? 'text-blue-600' : ''} /></Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => editor?.chain().focus().undo().run()} disabled={!editor} aria-label="Undo"><Undo2 /></Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => editor?.chain().focus().redo().run()} disabled={!editor} aria-label="Redo"><Redo2 /></Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => {
                const url = window.prompt('Enter image URL')
                if (url && editor) {
                  // @ts-ignore
                  editor.chain().focus().setImage({ src: url }).run()
                }
              }} disabled={!editor} aria-label="Insert Image">
                <ImageIcon className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 min-h-0">
              <EditorContent editor={editor} className="tiptap-editor h-full w-full p-2 text-base bg-white focus:outline-none focus:border-none overflow-y-auto" />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 border-t bg-white sticky bottom-0 z-10">
            <div className="flex items-center space-x-1">
              <Button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700 text-sm font-semibold" disabled={isSending}>
                {isSending ? "Sending..." : "Send"}
              </Button>
              <Button variant="ghost"><Paperclip className="h-5 w-5 text-gray-600" /></Button>
              <Button variant="ghost"><Link className="h-5 w-5 text-gray-600" /></Button>
              <Button variant="ghost"><ImageIcon className="h-5 w-5 text-gray-600" /></Button>
            </div>
            <div className="flex items-center">
              <Button variant="ghost"><Trash2 className="h-5 w-5 text-gray-600" /></Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

<style jsx global>{`
.tiptap-editor img {
  max-width: 100%;
  height: auto;
  display: block;
}
`}</style> 