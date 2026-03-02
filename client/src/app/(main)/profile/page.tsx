"use client"
import React, { useEffect, useState, useRef } from 'react';
import { Settings, Edit, Shield, Crown, LogOut, Bell, BellOff, Camera } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

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

export default function Profile() {
  const { user, logout, fetchUser } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pushSupported, setPushSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchUser().finally(() => setLoading(false));
    
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        setPushSupported(true);
        checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
        setIsSubscribed(true);
    }
  };

  const handleSubscribe = async () => {
    try {
        const registration = await navigator.serviceWorker.ready;
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        
        if (!vapidPublicKey) return;

        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
        
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey
        });

        await api.post('/notifications/subscribe', subscription);
        setIsSubscribed(true);
        alert('Notifications enabled!');
    } catch (error) {
        console.error('Failed to subscribe:', error);
        alert('Failed to enable notifications. Check permissions.');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    
    const file = event.target.files[0];
    setUploading(true);

    try {
        const response = await fetch(`/api/upload?filename=${file.name}`, {
            method: 'POST',
            body: file,
            headers: {
                'Authorization': `Bearer ${useAuthStore.getState().token}`
            }
        });
        
        if (!response.ok) throw new Error('Upload failed');
        
        const newBlob = await response.json();
        // Optimistically update user photos
        if (user) {
            useAuthStore.setState({
                user: {
                    ...user,
                    photos: [newBlob.url, ...(user.photos || [])]
                }
            });
        }
        alert('Photo uploaded!');
    } catch (error) {
        console.error(error);
        alert('Failed to upload photo');
    } finally {
        setUploading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-full text-white">Loading...</div>;
  if (!user) return <div className="text-white text-center mt-10">Please login</div>;

  return (
    <div className="h-full flex flex-col bg-dark-900 overflow-y-auto">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={inputFileRef} 
        className="hidden" 
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* Header / Cover */}
      <div className="relative h-48 bg-gradient-to-r from-primary to-orange-600">
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="relative"
            >
                <div className="w-32 h-32 rounded-full border-4 border-dark-900 overflow-hidden bg-dark-800 shadow-xl relative group cursor-pointer" onClick={() => inputFileRef.current?.click()}>
                    <img 
                        src={user.photos?.[0] || "https://via.placeholder.com/400"} 
                        alt="Profile" 
                        className={`w-full h-full object-cover transition-opacity ${uploading ? 'opacity-50' : 'group-hover:opacity-75'}`}
                    />
                    {uploading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <Camera size={32} className="text-white drop-shadow-md" />
                    </div>
                </div>
                <div className="absolute bottom-0 right-0 bg-blue-500 p-1.5 rounded-full border-2 border-dark-900 shadow-sm z-10">
                    <Shield size={16} className="text-white" fill="currentColor" />
                </div>
            </motion.div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-20 text-center px-4">
        <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            {user.name}, {user.age || 'N/A'}
            <Shield size={18} className="text-blue-500" />
        </h1>
        <p className="text-gray-400 mt-1">{user.bio || 'No bio yet'}</p>
      </div>

      {/* Premium Banner */}
      <div className="mx-4 mt-6 p-5 rounded-2xl bg-gradient-to-r from-yellow-600 to-yellow-400 relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex items-center justify-between">
            <div>
                <h3 className="font-bold text-black text-lg">LoveConnect Gold</h3>
                <p className="text-black/80 text-sm font-medium">See who likes you & more!</p>
            </div>
            <button className="bg-white text-yellow-700 px-5 py-2.5 rounded-full font-bold text-sm shadow-md hover:bg-yellow-50 transition-colors">
                Upgrade
            </button>
        </div>
        <Crown className="absolute -right-4 -bottom-4 text-white/30 w-32 h-32 rotate-12" />
      </div>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-4 p-4 mt-2">
        <button className="flex flex-col items-center p-4 bg-dark-800 rounded-2xl hover:bg-dark-700 transition-colors border border-dark-700">
            <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center mb-2 text-gray-400">
                <Settings size={20} />
            </div>
            <span className="text-xs text-gray-400 font-medium">Settings</span>
        </button>
        <button className="flex flex-col items-center p-4 bg-dark-800 rounded-2xl relative overflow-hidden border border-primary/20 hover:border-primary/50 transition-colors">
            <div className="absolute inset-0 bg-primary/5"></div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2 text-primary">
                <Edit size={20} />
            </div>
            <span className="text-xs text-primary font-medium">Edit Info</span>
        </button>
        <button className="flex flex-col items-center p-4 bg-dark-800 rounded-2xl hover:bg-dark-700 transition-colors border border-dark-700">
            <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center mb-2 text-gray-400">
                <Shield size={20} />
            </div>
            <span className="text-xs text-gray-400 font-medium">Safety</span>
        </button>
      </div>

      {/* Menu List */}
      <div className="px-4 pb-8 space-y-3">
        {pushSupported && (
             <button 
                onClick={handleSubscribe}
                disabled={isSubscribed}
                className="w-full p-4 bg-dark-800 rounded-2xl flex items-center justify-between text-white hover:bg-dark-700 transition-colors border border-dark-700"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isSubscribed ? 'bg-green-500/20 text-green-500' : 'bg-gray-700/50 text-gray-400'}`}>
                        {isSubscribed ? <Bell size={20} /> : <BellOff size={20} />}
                    </div>
                    <span className="font-medium">Notifications</span>
                </div>
                <span className={`text-sm ${isSubscribed ? 'text-green-500' : 'text-primary'}`}>
                    {isSubscribed ? 'Enabled' : 'Enable'}
                </span>
            </button>
        )}

        <button className="w-full p-4 bg-dark-800 rounded-2xl flex items-center justify-between text-white hover:bg-dark-700 transition-colors border border-dark-700">
            <span className="font-medium">Discovery Settings</span>
            <span className="text-gray-500 text-sm">Location, Age</span>
        </button>
        
        <button 
            onClick={handleLogout}
            className="w-full p-4 bg-dark-800/50 rounded-2xl flex items-center justify-center gap-2 text-red-500 font-medium mt-4 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
        >
            <LogOut size={18} />
            Logout
        </button>
      </div>
    </div>
  )
}
