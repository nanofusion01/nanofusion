import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Bot, User } from 'lucide-react'
import { ChatDetailActions } from './chat-detail-client'

type ChatMessage = {
  type?: 'Asistent' | 'Zákazník' | string
  text?: string
  time?: string
  role?: 'assistant' | 'user' | string
}

export default async function ChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: session } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!session) notFound()

  const messages: ChatMessage[] = Array.isArray(session.messages) ? (session.messages as any[]) : []

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/chats"
          className="inline-flex items-center gap-1.5 text-sm font-semibold mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={15} /> Zpět na seznam chatů
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {session.user_identifier || 'Anonymní návštěvník'}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Začátek {new Date(session.started_at).toLocaleString('cs-CZ')} · Poslední aktivita{' '}
              {new Date(session.last_activity).toLocaleString('cs-CZ')} · {messages.length} zpráv
            </p>
          </div>
          <ChatDetailActions id={session.id} status={session.status as 'open' | 'closed'} />
        </div>
      </div>

      <div
        className="rounded-xl p-6"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        {messages.length === 0 ? (
          <p className="text-sm text-center py-10" style={{ color: 'var(--text-muted)' }}>
            Tato relace zatím neobsahuje žádné zprávy.
          </p>
        ) : (
          <div className="flex flex-col gap-4 max-w-2xl mx-auto">
            {messages.map((msg, i) => {
              const isBot = msg.role === 'assistant' || msg.type === 'Asistent'
              return (
                <div key={i} className={`flex gap-2.5 ${isBot ? 'items-start' : 'items-start flex-row-reverse'}`}>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: isBot ? '#fef3c7' : '#e2e8f0', color: isBot ? '#d97706' : '#475569' }}
                  >
                    {isBot ? <Bot size={16} /> : <User size={16} />}
                  </div>
                  <div className={`flex flex-col max-w-[75%] ${isBot ? 'items-start' : 'items-end'}`}>
                    <div
                      className="px-4 py-2.5 rounded-2xl text-sm whitespace-pre-line"
                      style={
                        isBot
                          ? { background: 'var(--bg-surface-2)', color: 'var(--text-primary)', borderBottomLeftRadius: 4 }
                          : { background: 'var(--brand-primary)', color: '#fff', borderBottomRightRadius: 4 }
                      }
                    >
                      {msg.text || ''}
                    </div>
                    {msg.time && (
                      <span className="text-[11px] mt-1 px-1" style={{ color: 'var(--text-muted)' }}>
                        {msg.time}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
