// frontend/pages/index.js
import { useState } from 'react';
import axios from 'axios';
import Router from 'next/router';

export default function Login() {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  async function login(e){
    e.preventDefault();
    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, { email, password });
    localStorage.setItem('token', res.data.token); localStorage.setItem('userId', res.data.user.id);
    Router.push('/chat');
  }
  return (
    <div style={{maxWidth:420, margin:'50px auto'}}>
      <h1>ChatVista</h1>
      <form onSubmit={login}>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
      <p>Or <a href="/signup">Sign up</a></p>
    </div>
  );
}
