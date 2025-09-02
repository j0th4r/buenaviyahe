'use client'

import { useState, useEffect, useRef } from 'react'
import {
  MessageCircle,
  Send,
  Loader2,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
}

export function ChatbotWidget() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content:
        'Hola, soy Sean! 👋 Do you want to ask me about fun places to visit, cool activities to try, or travel tips on your adventure? 🌟🗺️',
      sender: 'bot',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    // Use a small delay to ensure DOM has updated
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input.trim() }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        sender: 'bot',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-18 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="h-14 w-14 rounded-full bg-teal-600 shadow-lg hover:bg-teal-700 hover:shadow-xl transition-all duration-200"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="sr-only">Open chat</span>
        </Button>
      </div>

      {/* Bottom Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Bottom Drawer */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 bg-background border-t rounded-t-xl shadow-2xl transition-transform duration-300 ease-out flex flex-col',
          isOpen ? 'translate-y-0' : 'translate-y-full',
          'h-[70vh] sm:h-[600px] max-h-[80vh]'
        )}
      >
        {/* Drawer Handle */}
        <div className="flex justify-center py-3 border-b bg-background rounded-t-xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 p-0 rounded-full hover:bg-muted"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Header */}
        <div className="p-4 border-b bg-background">
          <h2 className="text-lg font-semibold">Sean the Explorer</h2>
          <p className="text-sm text-muted-foreground">
            Ask me about spots, activities, and travel tips for
            Buenavista
          </p>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden bg-background">
          <ScrollArea className="h-full px-4 py-2">
            <div className="space-y-4 min-h-0 pb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex w-full',
                    message.sender === 'user'
                      ? 'justify-end'
                      : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'inline-flex max-w-[85%] flex-col gap-1 rounded-lg px-3 py-2 text-sm w-fit',
                      message.sender === 'user'
                        ? 'bg-teal-600 text-white'
                        : 'bg-muted'
                    )}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
                      {message.content}
                    </p>
                    <span
                      className={cn(
                        'text-xs opacity-70',
                        message.sender === 'user'
                          ? 'text-white/70'
                          : 'text-muted-foreground'
                      )}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex w-full justify-start">
                  <div className="inline-flex max-w-[85%] flex-col gap-1 rounded-lg bg-muted px-3 py-2 text-sm w-fit">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Checking the Map… 🗺️🔍</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="border-t p-4 bg-background">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                placeholder="Ask me about Buenavista..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="min-h-[40px] resize-none"
                autoFocus={isOpen}
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              size="sm"
              className="bg-teal-600 hover:bg-teal-700 h-[40px] w-[40px] p-0 shrink-0"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Powered by AI • Information may not always be accurate
          </p>
        </div>
      </div>
    </>
  )
}
