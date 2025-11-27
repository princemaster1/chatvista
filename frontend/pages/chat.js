import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';

export default function Chat(){
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(()=> {
    const token = localStorage.getItem('token');
    if(!token) { window.location.href = '/'; return; }
    const s = io(process.env.NEXT_PUBLIC_API_URL.replace('/api',''), { auth: { token } });
    s.on('connect', ()=> console.log('connected'));
    s.on('message', (m)=> {
      setMessages(prev => [...prev, m]);
    });
    s.on('status_update', ({ messageId, status }) => {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status } : m));
    });
    setSocket(s);
    return ()=> s.disconnect();
  },[]);

  useEffect(()=> { // fetch messages when conversation changes
    async function load(){
      if(!conversationId) return;
      const token = localStorage.getItem('token');
      const r = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/messages/${conversationId}/messages`, { headers: { Authorization: `Bearer ${token}` }});
      setMessages(r.data.messages);
      // mark as delivered/read (simple)
      r.data.messages.forEach(msg => {
        if(msg.sender_id !== null && msg.sender_id !== localStorage.getItem('userId')){
          axios.post(`${process.env.NEXT_PUBLIC_API_URL}/messages/${conversationId}/messages/${msg.id}/status`, { status: 'delivered' }, { headers: { Authorization: `Bearer ${token}` }});
        }
      });
    }
    load();
  },[conversationId]);

  async function send(){
    if(!text || !conversationId) return;
    socket.emit('send_message', { conversationId, content: text, ai: false });
    setText('');
  }

  async function askAI(){
    if(!text || !conversationId) return;
    const token = localStorage.getItem('token');
    const r = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/ai/respond`, { conversationId, prompt: text }, { headers: { Authorization: `Bearer ${token}` }});
    setText('');
  }

  return (
    <div className="flex gap-4 p-4">
      <div style={{width:300}} className="bg-slate-800 rounded p-2">
        <ConversationList onOpen={(id)=> { setConversationId(id); if(socket) socket.emit('join_conversation', id); }} />
      </div>
      <div className="flex-1 flex flex-col">
        <ChatWindow messages={messages} />
        <div className="flex gap-2 mt-2">
          <input className="flex-1 p-2 rounded bg-slate-700" value={text} onChange={e=>setText(e.target.value)} />
          <button onClick={send} className="px-4 py-2 bg-indigo-600 rounded">Send</button>
          <button onClick={askAI} className="px-4 py-2 bg-emerald-600 rounded">Ask AI</button>
        </div>
      </div>
    </div>
  )
}
