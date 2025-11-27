import useSWR from 'swr';
import axios from 'axios';
const fetcher = url => axios.get(url, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(r=>r.data);
export default function ConversationList({ onOpen }) {
  const { data, error } = useSWR('/api/conversations', fetcher, { refreshInterval: 5000 });
  if(!data) return <div>Loading...</div>
  return (
    <div className="p-2">
      {data.conversations.map(c => (
        <div key={c.id} className="p-2 border-b" onClick={()=>onOpen(c.id)}>
          <div className="font-bold">Conversation</div>
          <div className="text-sm">{c.last_message && c.last_message[0] ? c.last_message[0].content : ''}</div>
        </div>
      ))}
    </div>
  )
}
