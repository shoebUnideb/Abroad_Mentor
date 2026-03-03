import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { messagesApi } from '../../api/messages';
import PageHeader from '../../components/ui/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Card from '../../components/ui/Card';
import { Send } from 'lucide-react';

export default function MessagesPage() {
  const { user } = useAuth();
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages, refetch } = useApi(
    () => messagesApi.getThread(),
    []
  );

  // scroll to bottom whenever messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!newMsg.trim() || !messages) return;
    setSending(true);
    try {
      // Determine receiver: for mentor → superadmin. For admin → needs a selected mentor (simplified here)
      const otherMsg = messages[0];
      const receiver = otherMsg
        ? (otherMsg.sender.id === user?.id ? otherMsg.receiver : otherMsg.sender)
        : null;
      if (!receiver) return;
      await messagesApi.send(receiver.id, newMsg.trim());
      setNewMsg('');
      refetch();
    } finally { setSending(false); }
  };

  const msgs = messages ?? [];
  const other = msgs.length > 0
    ? (msgs[0].sender.id === user?.id ? msgs[0].receiver : msgs[0].sender)
    : null;

  const title = user?.role === 'mentor' ? 'Message Administrator' : `Messages`;

  return (
    <div className="max-w-2xl">
      <PageHeader title={title} subtitle="Direct communication channel." />

      <Card padding="none" className="flex flex-col" style={{ height: '520px' } as React.CSSProperties}>
        {other && (
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100">
            <Avatar name={`${other.first_name} ${other.last_name}`} size="sm" />
            <div>
              <p className="text-[13px] font-semibold text-gray-800">{other.first_name} {other.last_name}</p>
              <p className="text-[11px] text-gray-400 capitalize">{other.role}</p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {msgs.length === 0 && (
            <p className="text-center text-[13px] text-gray-400 mt-8">No messages yet. Start the conversation.</p>
          )}
          {msgs.map(m => {
            const isMe = m.sender.id === user?.id;
            return (
              <div key={m.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                {!isMe && <Avatar name={m.sender.username} size="sm" />}
                <div className={['max-w-[70%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed',
                  isMe ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm',
                ].join(' ')}>
                  {m.body}
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-200' : 'text-gray-400'}`}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="px-5 py-3.5 border-t border-gray-100 flex gap-2">
          <input value={newMsg} onChange={e => setNewMsg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Type a message…"
            className="flex-1 px-3.5 py-2.5 text-[13px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
          <button onClick={send} disabled={sending}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white rounded-lg transition-colors">
            <Send size={15} />
          </button>
        </div>
      </Card>
    </div>
  );
}
