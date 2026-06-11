'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export default function PushNotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      if (Notification.permission === 'default') {
        const timer = setTimeout(() => setShowPrompt(true), 5000);
        return () => clearTimeout(timer);
      } else if (Notification.permission === 'granted') {
        // Ensure service worker is registered and we have an active subscription synced with the backend
        navigator.serviceWorker.register('/sw.js').then(async (registration) => {
          const subscription = await registration.pushManager.getSubscription();
          const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
          
          if (publicVapidKey) {
            const activeSub = subscription || await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });
            
            // Always sync the subscription with the backend in case the DB was wiped
            // or if it failed to save the very first time.
            await fetch('/api/push/subscribe', {
              method: 'POST',
              body: JSON.stringify({ subscription: activeSub }),
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }).catch(console.error);
      }
    }
  }, []);

  const handleSubscribe = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setShowPrompt(false);
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicVapidKey) {
        console.error('VAPID public key not found');
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });

      await fetch('/api/push/subscribe', {
        method: 'POST',
        body: JSON.stringify({ subscription }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setShowPrompt(false);
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 right-4 max-w-sm bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl shadow-lg p-4 z-50 flex items-start gap-4"
      >
        <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400 mt-1">
          <Bell className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-[var(--color-text-primary)] mb-1">Never miss a contest</h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-3">
            Get notified 30 minutes before any upcoming contest starts.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleSubscribe}
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium py-1.5 px-3 rounded-lg transition-colors"
            >
              Enable
            </button>
            <button
              onClick={() => setShowPrompt(false)}
              className="bg-[var(--color-background)] hover:bg-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm font-medium py-1.5 px-3 rounded-lg transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
