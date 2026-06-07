'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { userApi } from '@/lib/api';
import { Link as LinkIcon, RefreshCw, Trophy, Flame, Target, Hexagon, Camera, Trash2, ExternalLink } from 'lucide-react';
import { PLATFORMS, PLATFORM_MAP } from '@/lib/constants';
import { AppShell } from '@/components/layout/AppShell';
import { getPlatformIcon } from '@/components/icons/PlatformIcons';
import { getPlatformColor, cn } from '@/lib/utils';

export default function ProfilePage() {
  const { user, isAuthenticated, loading, refreshUser } = useAuth();
  const router = useRouter();
  
  const [handle, setHandle] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('CODEFORCES');
  const [isLinking, setIsLinking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [profileForm, setProfileForm] = useState({ username: '', email: '', avatarUrl: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 128;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/webp', 0.8);
          setProfileForm(prev => ({ ...prev, avatarUrl: dataUrl }));
          
          setIsUpdatingProfile(true);
          userApi.updateProfile({ ...profileForm, avatarUrl: dataUrl })
            .then(() => {
              setMessage({ text: 'Avatar updated successfully!', type: 'success' });
              refreshUser();
            })
            .catch((err) => {
              setMessage({ text: err.response?.data?.message || 'Failed to update avatar', type: 'error' });
            })
            .finally(() => setIsUpdatingProfile(false));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || '',
        email: user.email || '',
        avatarUrl: user.avatarUrl || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh] w-full">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
        </div>
      </AppShell>
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

  const handleUnlinkPlatform = async (platform: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to unlink ${platform}?`)) return;
    
    setMessage({ text: '', type: '' });
    try {
      await userApi.unlinkPlatform(platform);
      setMessage({ text: 'Platform unlinked successfully!', type: 'success' });
      await refreshUser();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Failed to unlink platform', type: 'error' });
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setMessage({ text: '', type: '' });
    try {
      await userApi.updateProfile(profileForm);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      await refreshUser();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Failed to update profile', type: 'error' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const openPlatformProfile = (platform: string, handle: string) => {
    let url = '';
    switch (platform) {
      case 'CODEFORCES': url = `https://codeforces.com/profile/${handle}`; break;
      case 'LEETCODE': url = `https://leetcode.com/${handle}`; break;
      case 'ATCODER': url = `https://atcoder.jp/users/${handle}`; break;
      case 'CODECHEF': url = `https://www.codechef.com/users/${handle}`; break;
    }
    if (url) window.open(url, '_blank');
  };

  return (
    <AppShell>
      <div className="w-full relative pb-20">
        {/* Banner */}
        <div className="w-full h-64 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 relative overflow-hidden border-b border-[var(--color-border)]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-void)] to-transparent"></div>
          <div className="absolute top-10 left-1/4 w-32 h-32 bg-slate-200 rounded-full mix-blend-screen filter blur-[60px] opacity-30 animate-pulse"></div>
          <div className="absolute top-20 right-1/4 w-40 h-40 bg-white rounded-full mix-blend-screen filter blur-[70px] opacity-20"></div>
        </div>

        <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
          
          {message.text && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-xl border backdrop-blur-md ${message.type === 'success' ? 'bg-white/10 border-white/30 text-slate-100 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]'}`}
            >
              {message.text}
            </motion.div>
          )}

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleAvatarUpload} 
            accept="image/*" 
            className="hidden" 
          />

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-surface rounded-3xl p-8 lg:p-12 relative overflow-hidden shadow-2xl flex flex-col lg:flex-row gap-12"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-300 via-white to-slate-100" />
            
            {/* Left Section: User Identity & Profile Form */}
            <div className="w-full lg:w-1/3 flex flex-col gap-8">
              
              <div className="flex flex-col items-center text-center">
                <div 
                  className="relative mb-6 group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-200 to-white rounded-full blur opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                  {profileForm.avatarUrl || user?.avatarUrl ? (
                    <img 
                      src={profileForm.avatarUrl || user?.avatarUrl} 
                      alt="Avatar" 
                      className="w-32 h-32 rounded-full bg-[var(--color-panel)] border-4 border-[var(--color-void)] relative z-10 object-cover group-hover:opacity-80 transition-opacity"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-[var(--color-panel)] border-4 border-[var(--color-void)] relative z-10 flex items-center justify-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-slate-300 to-white uppercase group-hover:opacity-80 transition-opacity">
                      {user?.username?.charAt(0) || 'U'}
                    </div>
                  )}
                  
                  {/* Upload Overlay */}
                  <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/50 p-2 rounded-full backdrop-blur-sm">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <div className="absolute -bottom-2 -right-2 bg-white text-white w-10 h-10 rounded-full border-4 border-[var(--color-void)] flex items-center justify-center z-30 shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                    <Hexagon className="w-5 h-5 fill-current" />
                  </div>
                </div>

                <h1 className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight mb-1">{user?.username}</h1>
                <p className="text-[var(--color-text-secondary)] font-medium mb-8 flex items-center gap-2 justify-center">
                  <Target className="w-4 h-4" /> {user?.email}
                </p>

                <div className="w-full p-5 rounded-2xl bg-[var(--color-void)]/50 border border-[var(--color-border)] shadow-inner flex items-center justify-between mb-8">
                  <div className="text-left">
                    <p className="text-xs uppercase tracking-widest text-[var(--color-text-muted)] font-bold mb-1">Total Solved</p>
                    <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300 drop-shadow-md">
                      {user?.totalSolved || 0}
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                    <Trophy className="w-7 h-7 text-slate-100" />
                  </div>
                </div>
              </div>

              {/* Profile Details Form */}
              <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
                <h3 className="text-sm uppercase tracking-widest font-bold text-[var(--color-text-secondary)] mb-2">
                  Profile Details
                </h3>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={profileForm.username}
                    onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                    className="w-full bg-[var(--color-void)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-slate-200 focus:ring-1 focus:ring-slate-200 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full bg-[var(--color-void)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-slate-200 focus:ring-1 focus:ring-slate-200 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="mt-2 py-3 bg-[var(--color-elevated)] hover:bg-[var(--color-border)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] text-sm font-bold tracking-wide transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingProfile ? 'UPDATING...' : 'UPDATE PROFILE'}
                </button>
              </form>

            </div>

            {/* Right Section: Personal information & Linked Platforms */}
            <div className="w-full lg:w-2/3 flex flex-col">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Personal information</h2>
                  <p className="text-[var(--color-text-secondary)] text-sm mt-1">Manage your connected competitive programming profiles</p>
                </div>
                <button 
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-void)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-sm font-bold text-[var(--color-text-primary)] transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-slate-300' : 'text-[var(--color-text-secondary)] group-hover:text-slate-300 transition-colors'}`} />
                  {isSyncing ? 'SYNCING...' : 'SYNC ALL DATA'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {user?.platforms && user.platforms.length > 0 ? (
                  user.platforms.map((p) => {
                    const info = PLATFORM_MAP[p.platform];
                    return (
                      <div 
                        key={p.platform} 
                        onClick={() => openPlatformProfile(p.platform, p.handle)}
                        className="group relative overflow-hidden rounded-2xl bg-[var(--color-void)]/40 border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer p-5 flex flex-col h-full"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 transition-opacity group-hover:opacity-20" style={{ backgroundColor: info?.color || '#ffffff' }}></div>
                        
                        {/* Unlink Button */}
                        <button 
                          onClick={(e) => handleUnlinkPlatform(p.platform, e)}
                          className="absolute top-4 right-4 p-1.5 rounded-md bg-transparent hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all z-10"
                          title="Unlink Platform"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="absolute top-4 right-12 p-1.5 rounded-md text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-all z-10">
                          <ExternalLink className="w-4 h-4" />
                        </div>

                        <div className="flex items-center gap-4 mb-4 mt-2">
                          <div className="w-12 h-12 rounded-xl bg-[var(--color-panel)] flex items-center justify-center border border-[var(--color-border)] shadow-inner" style={{ boxShadow: `inset 0 0 10px ${info?.color}20` }}>
                            <div style={{ color: getPlatformColor(p.platform) }}>
                              {getPlatformIcon(p.platform, "w-6 h-6")}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-widest text-[var(--color-text-secondary)] font-bold">{info?.name || p.platform}</p>
                            <p className="text-lg font-bold text-[var(--color-text-primary)] tracking-tight">{p.handle}</p>
                          </div>
                        </div>
                        
                        <div className="mt-auto pt-4 border-t border-[var(--color-border)] flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-muted)]">
                            <Flame className="w-3.5 h-3.5 text-slate-100" />
                            Active
                          </div>
                          {p.syncedAt && (
                            <div className="text-[10px] text-[var(--color-text-muted)] font-mono">
                              {new Date(p.syncedAt).toLocaleDateString()} {new Date(p.syncedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-[var(--color-border)] rounded-2xl bg-[var(--color-void)]/20">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-panel)] flex items-center justify-center mb-4 text-slate-500">
                      <LinkIcon className="w-8 h-8" />
                    </div>
                    <p className="text-[var(--color-text-primary)] font-bold text-lg mb-1">No platforms connected</p>
                    <p className="text-[var(--color-text-secondary)] text-sm max-w-sm text-center">Link your coding profiles below to start aggregating your stats.</p>
                  </div>
                )}
              </div>

              <div className="relative mt-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-200/5 to-white/5 rounded-2xl" />
                <form onSubmit={handleLinkPlatform} className="relative p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-void)]/60">
                  <h3 className="text-sm uppercase tracking-widest font-bold text-[var(--color-text-secondary)] mb-5 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" /> Link New Platform
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative sm:w-1/3">
                      <select 
                        value={selectedPlatform}
                        onChange={(e) => setSelectedPlatform(e.target.value)}
                        className="w-full bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl pl-4 pr-10 py-3.5 text-[var(--color-text-primary)] text-sm font-medium focus:outline-none focus:border-slate-200 focus:ring-1 focus:ring-slate-200 appearance-none shadow-inner cursor-pointer"
                      >
                        {PLATFORMS.map(p => (
                          <option key={p.key} value={p.key} className="bg-[var(--color-panel)] font-medium py-2">{p.name}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[var(--color-text-secondary)]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                    
                    <input
                      type="text"
                      required
                      placeholder="Enter your platform handle"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      className="flex-1 bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl px-4 py-3.5 text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white placeholder-[var(--color-text-muted)] shadow-inner transition-colors"
                    />
                    
                    <button
                      type="submit"
                      disabled={isLinking}
                      className="sm:w-32 py-3.5 bg-gradient-to-r from-slate-200 to-emerald-600 hover:from-slate-300 hover:to-white rounded-xl text-white text-sm font-bold tracking-wide transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLinking ? 'LINKING...' : 'CONNECT'}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
