// frontend/pages/signup.js
import { useState } from 'react';
import axios from 'axios';
import Router from 'next/router';

export default function Signup(){
  const [form,setForm] = useState({});
  async function submit(e){
    e.preventDefault();
    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, form);
    localStorage.setItem('token', res.data.token); localStorage.setItem('userId', res.data.user.id);
    Router.push('/chat');
  }
  return (
    <div style={{maxWidth:420, margin:'50px auto'}}>
      <h1>Sign up</h1>
      <form onSubmit={submit}>
        <input placeholder="Username" onChange={e=>setForm({...form,username:e.target.value})} />
        <input placeholder="Email" onChange={e=>setForm({...form,email:e.target.value})} />
        <input placeholder="Password" type="password" onChange={e=>setForm({...form,password:e.target.value})} />
        <button type="submit">Create account</button>
      </form>
    </div>
  );
}
