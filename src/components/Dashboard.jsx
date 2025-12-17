import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { LinkCard } from './LinkCard';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Plus, Eye, Copy, Check } from 'lucide-react';
import { LinkPage } from './LinkPage';
import { fetchLinks, createLink as apiCreateLink, deleteLink as apiDeleteLink } from '../api/client';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('links');
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [links, setLinks] = useState([]);
  const [profile, setProfile] = useState({ username: 'johndoe', name: 'John Doe', bio: 'Creator • Designer • Developer' });
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        const res = user && user.id ? await fetchLinks(user.id) : await fetchLinks();
        if (res && res.links) {
          setLinks(res.links.map((l, i) => ({ id: l._id || l.id || i, title: l.title, url: l.url, visible: l.visible ?? true })));
        }
      } catch (err) {
        console.error('Failed to load links', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(`linkhub.bio/${profile.username}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  const handleDeleteLink = async (id) => {
    try {
      if (typeof id === 'string' && id.length > 8) await apiDeleteLink(id);
      setLinks((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleAddLink = async () => {
    if (!newTitle || !newUrl) return;
    try {
      const res = await apiCreateLink({ title: newTitle, url: newUrl });
      if (res && res.link) {
        const l = res.link;
        setLinks((prev) => [{ id: l._id || l.id, title: l.title, url: l.url, visible: l.visible ?? true }, ...prev]);
      } else {
        setLinks((prev) => [{ id: Date.now(), title: newTitle, url: newUrl, visible: true }, ...prev]);
      }
      setNewTitle('');
      setNewUrl('');
    } catch (err) {
      console.error('Create failed', err);
    }
  };

  const handleToggleVisibility = (id) => {
    setLinks((prev) => prev.map((link) => (link.id === id ? { ...link, visible: !link.visible } : link)));
  };

  const renderLinksTab = () => (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2>Manage Links</h2>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowPreview((s) => !s)} className="rounded-2xl">
            <Eye className="w-4 h-4 mr-2" /> {showPreview ? 'Hide Preview' : 'Preview'}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex gap-2 items-center">
          <Input placeholder="Link title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          <Input placeholder="https://example.com" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
          <Button onClick={handleAddLink} className="bg-[#5B4BFF] text-white rounded-2xl">
            <Plus className="w-4 h-4 mr-2" /> Add
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h4>Your Links</h4>
                <span className="text-sm text-[#555555]">{links.length} links</span>
              </div>
              <div className="space-y-3">
                {loading && <div>Loading...</div>}
                {!loading && links.map((link) => (
                  <LinkCard key={link.id} title={link.title} url={link.url} visible={link.visible} onDelete={() => handleDeleteLink(link.id)} onToggleVisibility={() => handleToggleVisibility(link.id)} />
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#5B4BFF] to-[#7B6EFF] rounded-3xl p-6 text-white shadow-lg">
              <h4 className="text-white mb-2">Your Link</h4>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                <span className="flex-1 truncate">linkhub.bio/{profile.username}</span>
                <Button size="sm" onClick={handleCopyLink} className="bg-white/20 hover:bg-white/30 text-white rounded-xl">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          {showPreview && (
            <div className="lg:sticky lg:top-6 h-fit">
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 flex items-center gap-2 border-b">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 text-center text-xs text-gray-500">linkhub.bio/{profile.username}</div>
                </div>
                <div className="h-[600px] overflow-y-auto p-4">
                  <LinkPage username={profile.username} name={profile.name} bio={profile.bio} links={links.filter((l) => l.visible)} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'links' && renderLinksTab()}
          {activeTab === 'profile' && (
            <div className="max-w-2xl">
              <h2 className="mb-6">Profile Settings</h2>
              <div className="bg-white rounded-3xl p-8 shadow-lg space-y-6">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <div className="flex gap-2 mt-2">
                    <span className="px-4 py-2 bg-gray-100 rounded-2xl text-[#555555]">linkhub.bio/</span>
                    <Input id="username" value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} className="rounded-2xl" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="name">Display Name</Label>
                  <Input id="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="rounded-2xl mt-2" />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} className="rounded-2xl mt-2" rows={3} />
                </div>
                <Button className="bg-[#5B4BFF] hover:bg-[#4B3BEF] text-white rounded-2xl w-full">Save Changes</Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
          