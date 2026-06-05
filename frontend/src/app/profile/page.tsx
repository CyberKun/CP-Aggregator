'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { userApi } from '@/lib/api';
import { User, Link as LinkIcon, RefreshCw, CheckCircle } from 'lucide-react';
import { PLATFORMS } from '@/lib/constants';
import { AppShell } from '@/components/layout/AppShell';
import { getPlatformIcon } from '@/components/icons/PlatformIcons';
import { getPlatformColor } from '@/lib/utils';

export default function ProfilePage() {
  const { user, isAuthenticated, loading, refreshUser } = useAuth();
  const router = useRouter();
  
  const [handle, setHandle] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('CODEFORCES');
  const [isLinking, setIsLinking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLinkPlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLinking(true);
    setMessage({ text: '', type: '' });
    try {
      await userApi.linkPlatform({ platform: selectedPlatform, handle });
      setMessage({ text: 'Platform linked successfully!', type: 'success' });
      setHandle('');
      await refreshUser();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Failed to link platform', type: 'error' });
    } finally {
      setIsLinking(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setMessage({ text: '', type: '' });
    try {
      await userApi.syncData();
      setMessage({ text: 'Data synced successfully!', type: 'success' });
      await refreshUser();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Failed to sync data', type: 'error' });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-12">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Profile</h1>
          <p className="text-slate-400 mt-2">Manage your account and linked platforms.</p>
        </div>

        {message.text && (
          <div className={`p-4 rounded-lg border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-red-500/10 border-red-500/50 text-red-400'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Info Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-1 glass rounded-2xl border border-white/10 p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500" />
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <User className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{user?.username}</h2>
                <p className="text-sm text-slate-400">{user?.email}</p>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Solved</p>
                <p className="text-2xl font-bold text-emerald-400">{user?.totalSolved || 0}</p>
              </div>
              <TrophyIcon className="w-8 h-8 text-emerald-500/50" />
            </div>
          </motion.div>

          {/* Linked Platforms */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-1 md:col-span-2 glass rounded-2xl border border-white/10 p-6 relative"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Linked Platforms</h3>
              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-slate-300 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Data'}
              </button>
            </div>

            <div className="space-y-4 mb-8">
              {user?.platforms && user.platforms.length > 0 ? (
                user.platforms.map((p) => (
                  <div key={p.platform} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div style={{ color: getPlatformColor(p.platform) }}>
                        {getPlatformIcon(p.platform, "w-6 h-6")}
                      </div>
                      <div>
                        <p className="font-medium text-white">{p.platform}</p>
                        <p className="text-sm text-slate-400">Handle: {p.handle}</p>
                      </div>
                    </div>
                    {p.syncedAt && (
                      <div className="text-xs text-slate-500 text-right">
                        Last synced:<br/>
                        {new Date(p.syncedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">No platforms linked yet.</p>
              )}
            </div>

            <form onSubmit={handleLinkPlatform} className="pt-6 border-t border-white/10">
              <h4 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                <LinkIcon className="w-4 h-4" /> Link New Platform
              </h4>
              <div className="flex flex-col sm:flex-row gap-4">
                <select 
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {PLATFORMS.map(p => (
                    <option key={p.key} value={p.key} className="bg-[#0f111a]">{p.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  required
                  placeholder="Platform Handle"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-slate-500"
                />
                <button
                  type="submit"
                  disabled={isLinking}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isLinking ? 'Linking...' : 'Link'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}

function TrophyIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
