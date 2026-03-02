"use client"
import React, { useState, useEffect } from 'react';
import SplashScreen from '@/components/SplashScreen';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';

function urlBase64ToUint8Array(base64String: string) {
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
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showSplash, setShowSplash] = useState(true);
  const { fetchUser, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // Handle splash screen finish
  const handleSplashFinish = () => {
    setShowSplash(false);
    if (user && (pathname === '/login' || pathname === '/register' || pathname === '/')) {
        router.push('/matches');
    }
  };

  // Register Service Worker & Subscribe to Push
  useEffect(() => {
    if ('serviceWorker' in navigator && user) {
        const registerSW = async () => {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('SW registered: ', registration);

                // Check permission
                if (Notification.permission === 'default') {
                    const permission = await Notification.requestPermission();
                    if (permission !== 'granted') return;
                }

                if (Notification.permission === 'granted') {
                    // Subscribe
                    const subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
                    });

                    // Send to server
                    await api.post('/notifications/subscribe', subscription);
                    console.log('Push Subscribed');
                }

            } catch (error) {
                console.log('SW registration failed: ', error);
            }
        };
        registerSW();
    }
  }, [user]);

  // Try to fetch user while splash is showing
  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <>
      {showSplash ? (
        <SplashScreen onFinish={handleSplashFinish} />
      ) : (
        children
      )}
    </>
  );
}
