'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import ClientLayout from '@/components/client/ClientLayout'
import {
  MessageSquare,
  Send,
  User,
  Briefcase
} from 'lucide-react'

interface Message {
  id: string
  message_text: string
  sender_id: string
  created_at: string
  is_from_coach: boolean
}

export default function ChatPage() {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMessages()

    // Subscribe to new messages
    const channel = supabase
      .channel('chat-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages'
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function loadMessages() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setUserId(user.id)

    // Get user's business
    const { data: businessData } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!businessData) {
      setLoading(false)
      return
    }

    setBusinessId(businessData.id)

    // Get messages from API
    const res = await fetch(`/api/chat/messages?business_id=${businessData.id}`)
    const data = await res.json()

    if (data.success) {
      setMessages(data.messages || [])
    } else {
      console.error('Error loading messages:', data.error)
    }

    setLoading(false)
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !businessId) return

    setSending(true)

    const res = await fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_id: businessId,
        message: newMessage.trim()
      })
    })

    const data = await res.json()

    if (!data.success) {
      console.error('Error sending message:', data.error)
    } else {
      setNewMessage('')
    }

    setSending(false)
  }

  return (
    <ClientLayout>
      <div className="flex flex-col h-[calc(100vh-12rem)]">
        {/* Header */}
        <div className="bg-white rounded-t-lg border border-gray-200 border-b-0 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Chat with Your Coach</h2>
              <p className="text-sm text-gray-600">Ask questions and get support</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 bg-white border-x border-gray-200 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <MessageSquare className="w-12 h-12 text-gray-400 animate-pulse" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages Yet</h3>
              <p className="text-gray-600 max-w-md">
                Start a conversation with your coach. Ask questions, share updates, or request guidance.
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.is_from_coach ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`flex gap-3 max-w-2xl ${message.is_from_coach ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.is_from_coach ? 'bg-indigo-100' : 'bg-teal-100'
                    }`}>
                      {message.is_from_coach ? (
                        <Briefcase className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <User className="w-4 h-4 text-teal-600" />
                      )}
                    </div>
                    <div>
                      <div className={`rounded-lg px-4 py-3 ${
                        message.is_from_coach
                          ? 'bg-gray-100 text-gray-900'
                          : 'bg-teal-600 text-white'
                      }`}>
                        <p className="text-sm">{message.message_text}</p>
                      </div>
                      <p className={`text-xs text-gray-500 mt-1 ${message.is_from_coach ? 'text-left' : 'text-right'}`}>
                        {new Date(message.created_at).toLocaleTimeString('en-AU', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="bg-white rounded-b-lg border border-gray-200 border-t-0 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              disabled={sending || !businessId}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending || !businessId}
              className="bg-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </form>
      </div>
    </ClientLayout>
  )
}
