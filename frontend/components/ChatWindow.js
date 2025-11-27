import { useEffect, useRef } from 'react';
export default function ChatWindow({ messages, onSeen }) {
  const endRef = useRef();
  useEffect(()=> { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages]);
  return (
    <div className="flex-1 p-4 h-[60vh] overflow-auto bg-slate-900 rounded">
      {messages.map(m => (
        <div key={m.id} className="mb-3">
          <div className="text-xs text-slate-400">{m.sender_id}</div>
          <div className="p-2 bg-slate-700 rounded">{m.content}</div>
          <div className="text-xs text-slate-500">{m.status}{m.ai_generated ? ' (AI)' : ''}</div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  )
}
