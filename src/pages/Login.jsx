import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/client';
import { Button } from '../components/ui/button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const nav = useNavigate();

  async function handle(e) {
    e.preventDefault();
    const res = await login({ email, password });
    if (res.token) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user || {}));
      nav('/dashboard');
    } else {
      setError(res.error || 'Login failed');
    }
  }

  return (
    <div className="max-w-md mx-auto py-20">
      <h2 className="text-2xl mb-4">Login</h2>
      <form onSubmit={handle} className="space-y-4">
        <input className="w-full" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <div className="text-red-600">{error}</div>}
        <Button type="submit">Login</Button>
      </form>
    </div>
  );
}
