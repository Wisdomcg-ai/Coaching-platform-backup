'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ConversationList, type Conversation } from '@/components/coach/messages/ConversationList'
import { MessageThread, type Message } from '@/components/coach/messages/MessageThread'
import { MessageComposer } from '@/components/coach/messages/MessageComposer'
import { BroadcastModal } from '@/components/coach/messages/BroadcastModal'
import {
  Loader2,
  MessageSquare,
  Send,
  Radio
} from 'lucide-react'

interface Client {
  id: string
  businessName: string
  industry?: string
  status: string
}

export default function MessagesPage() {
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [showBroadcastModal, setShowBroadcastModal] = useState(false)

  // Message templates
  const messageTemplates = [
    {
      id: '1',
      name: 'Session Reminder',
      content: 'Hi! Just a friendly reminder about our upcoming coaching session. Looking forward to speaking with you.'
    },
    {
      id: '2',
      name: 'Action Follow-up',
      content: 'Hi! I wanted to check in on the action items we discussed in our last session. How are you progressing?'
    },
    {
      id: '3',
      name: 'Weekly Check-in',
      content: 'Hi! Hope you\'re having a productive week. Is there anything you\'d like to discuss before our next session?'
    }
  ]

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.businessId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation?.id])

  async function loadData() {
    try {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setCurrentUserId(user.id)

      // Load businesses (clients)
      const { data: businessesData } = await supabase
        .from('businesses')
        .select('id, business_name, industry, status')
        .eq('assigned_coach_id', user.id)
        .order('business_name')

      if (businessesData) {
        setClients(businessesData.map(b => ({
          id: b.id,
          businessName: b.business_name || 'Unnamed',
          industry: b.industry || undefined,
          status: b.status || 'active'
        })))
      }

      // Load conversations (aggregate messages by business)
      const { data: messagesData } = await supabase
        .from('messages')
        .select(`
          id,
          business_id,
          content,
          created_at,
          read,
          sender_id,
          businesses (
            business_name
          )
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (messagesData) {
        // Group by business_id and get latest message per conversation
        const conversationMap = new Map<string, Conversation>()

        messagesData.forEach(msg => {
          const businessData = msg.businesses as unknown
          const business = Array.isArray(businessData)
            ? businessData[0] as { business_name: string } | undefined
            : businessData as { business_name: string } | null

          if (!msg.business_id) return

          const existing = conversationMap.get(msg.business_id)

          if (!existing) {
            conversationMap.set(msg.business_id, {
              id: msg.business_id,
              businessId: msg.business_id,
              businessName: business?.business_name || 'Unknown',
              lastMessage: msg.content || '',
              lastMessageAt: msg.created_at,
              unreadCount: msg.read === false && msg.sender_id !== user.id ? 1 : 0,
              isStarred: false,
              isArchived: false
            })
          } else if (!msg.read && msg.sender_id !== user.id) {
            existing.unreadCount++
          }
        })

        setConversations(Array.from(conversationMap.values()))

        // Auto-select first conversation if none selected
        if (!selectedConversation && conversationMap.size > 0) {
          const first = Array.from(conversationMap.values())[0]
          setSelectedConversation(first)
        }
      }

    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadMessages(businessId: string) {
    try {
      setLoadingMessages(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: messagesData } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          read,
          sender_id,
          users:sender_id (
            full_name
          )
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: true })

      if (messagesData) {
        setMessages(messagesData.map(msg => {
          const userData = msg.users as unknown
          const senderUser = Array.isArray(userData)
            ? userData[0] as { full_name: string } | undefined
            : userData as { full_name: string } | null

          return {
            id: msg.id,
            content: msg.content || '',
            senderId: msg.sender_id || '',
            senderName: senderUser?.full_name || 'Unknown',
            senderType: msg.sender_id === user.id ? 'coach' as const : 'client' as const,
            createdAt: msg.created_at,
            status: msg.read ? 'read' as const : 'delivered' as const
          }
        }))

        // Mark messages as read
        await supabase
          .from('messages')
          .update({ read: true })
          .eq('business_id', businessId)
          .eq('recipient_id', user.id)
          .eq('read', false)

        // Update conversation unread count
        setConversations(prev => prev.map(conv =>
          conv.businessId === businessId
            ? { ...conv, unreadCount: 0 }
            : conv
        ))
      }

    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation || !currentUserId) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get business owner for recipient
    const { data: business } = await supabase
      .from('businesses')
      .select('owner_id')
      .eq('id', selectedConversation.businessId)
      .single()

    const { data: newMessage, error } = await supabase
      .from('messages')
      .insert({
        business_id: selectedConversation.businessId,
        sender_id: user.id,
        recipient_id: business?.owner_id || null,
        content,
        read: false
      })
      .select()
      .single()

    if (error) {
      console.error('Error sending message:', error)
      throw error
    }

    // Add to local state
    if (newMessage) {
      setMessages(prev => [...prev, {
        id: newMessage.id,
        content: newMessage.content,
        senderId: user.id,
        senderName: 'You',
        senderType: 'coach',
        createdAt: newMessage.created_at,
        status: 'sent'
      }])

      // Update conversation
      setConversations(prev => prev.map(conv =>
        conv.businessId === selectedConversation.businessId
          ? { ...conv, lastMessage: content, lastMessageAt: newMessage.created_at }
          : conv
      ))
    }
  }

  const handleBroadcastSend = async (clientIds: string[], message: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Send message to each client
    const promises = clientIds.map(async (businessId) => {
      const { data: business } = await supabase
        .from('businesses')
        .select('owner_id')
        .eq('id', businessId)
        .single()

      return supabase
        .from('messages')
        .insert({
          business_id: businessId,
          sender_id: user.id,
          recipient_id: business?.owner_id || null,
          content: message,
          read: false
        })
    })

    await Promise.all(promises)

    // Reload conversations
    await loadData()
  }

  const handleToggleStar = (conversationId: string) => {
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId
        ? { ...conv, isStarred: !conv.isStarred }
        : conv
    ))
  }

  // Stats
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  if (loading) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-500 mt-1">
            {conversations.length} conversations &middot; {totalUnread} unread
          </p>
        </div>
        <button
          onClick={() => setShowBroadcastModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Radio className="w-4 h-4" />
          Broadcast
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation List */}
        <div className="w-80 flex-shrink-0">
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversation?.id}
            onSelect={setSelectedConversation}
            onToggleStar={handleToggleStar}
          />
        </div>

        {/* Message Thread */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedConversation ? (
            <>
              {loadingMessages ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
              ) : (
                <MessageThread
                  messages={messages}
                  businessId={selectedConversation.businessId}
                  businessName={selectedConversation.businessName}
                  currentUserId={currentUserId}
                />
              )}
              <MessageComposer
                onSend={handleSendMessage}
                templates={messageTemplates}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No conversation selected</h3>
                <p className="text-gray-500">
                  Select a conversation from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Broadcast Modal */}
      <BroadcastModal
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
        onSend={handleBroadcastSend}
        clients={clients}
      />
    </div>
  )
}
