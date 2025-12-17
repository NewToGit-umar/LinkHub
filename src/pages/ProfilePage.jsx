import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';

export default function ProfilePage() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  });

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  }

  return (
    <div className="max-w-3xl mx-auto py-12">
      <h2 className="text-2xl mb-4">Profile</h2>
      <div className="space-y-2">
        <div><strong>Name:</strong> {user.name}</div>
        <div><strong>Email:</strong> {user.email}</div>
        <div><strong>Theme:</strong> {user.theme || 'light'}</div>
        <Button onClick={logout}>Logout</Button>
      </div>
    </div>
  );
}
