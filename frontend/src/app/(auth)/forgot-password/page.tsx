'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setIsSuccess(true);
      setMessage(res.data.message);
      
      // For development/demo without real SMTP: log the test URL
      if (res.data.previewUrl) {
        console.log('TEST EMAIL PREVIEW URL:', res.data.previewUrl);
        // We shouldn't show this to real users, but helpful for testing:
        if (process.env.NODE_ENV === 'development') {
          alert('Dev Mode: Check browser console for the email preview link!');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
              Reset Password
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter your email to receive a password reset link
            </p>
          </div>

          {isSuccess ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center space-y-4 py-4"
            >
              <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-center text-sm text-green-400 font-medium">
                {message}
              </p>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Please check your inbox and spam folder.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full bg-background/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>

              {error && (
                <motion.p 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                  className="text-red-400 text-xs text-center font-medium bg-red-400/10 py-2 rounded-lg"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center disabled:opacity-70"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <Link 
              href="/login" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
