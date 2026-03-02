"use client"
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SwipeCard from '@/components/SwipeCard';
import { X, Heart, Zap, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface UserProfile {
  _id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  distance?: number;
}

export default function Matches() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data } = await api.get('/users/feed');
      setProfiles(data);
    } catch (error) {
      console.error("Failed to fetch profiles", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (profiles.length === 0) return;
    
    const currentProfile = profiles[0];
    const type = direction === 'right' ? 'like' : 'nope';

    setProfiles((prev) => prev.slice(1));

    try {
      const { data } = await api.post('/matches/swipe', {
        toUser: currentProfile._id,
        type
      });

      if (data.match) {
        // Simple Match Modal Logic (Could be a separate component)
        alert(`It's a match with ${currentProfile.name}!`);
      }
    } catch (error) {
      console.error("Swipe failed", error);
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-full bg-dark-900 text-white">
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
                <Loader2 className="w-8 h-8 text-primary" />
            </motion.div>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 bg-dark-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-sm h-[70vh] md:h-[650px]">
        <AnimatePresence>
          {profiles.map((profile) => (
            <SwipeCard 
                key={profile._id} 
                profile={{
                    id: profile._id,
                    name: profile.name,
                    age: profile.age,
                    bio: profile.bio,
                    image: profile.photos[0] || 'https://via.placeholder.com/400',
                    distance: 10
                }} 
                onSwipe={handleSwipe} 
            />
          )).reverse()}
        </AnimatePresence>
        
        {profiles.length === 0 && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full text-white text-center p-6"
            >
                <div className="w-24 h-24 bg-dark-800 rounded-full flex items-center justify-center mb-6 shadow-xl border border-dark-700">
                    <Heart size={40} className="text-gray-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">No more profiles</h3>
                <p className="text-gray-400 max-w-[200px]">Check back later for more matches around you!</p>
                <button 
                    onClick={() => fetchProfiles()} 
                    className="mt-8 px-6 py-3 bg-dark-800 rounded-full text-sm font-bold hover:bg-dark-700 transition-colors border border-dark-700"
                >
                    Refresh
                </button>
            </motion.div>
        )}
      </div>

      {/* Controls */}
      {profiles.length > 0 && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex gap-6 mt-8 z-10"
          >
            <button 
                onClick={() => handleSwipe('left')}
                className="group p-4 bg-dark-800 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 border border-dark-700 shadow-xl hover:shadow-red-500/30"
            >
                <X size={28} className="group-hover:scale-110 transition-transform" />
            </button>
            <button className="group p-3 bg-dark-800 rounded-full text-purple-400 hover:bg-purple-500 hover:text-white transition-all duration-300 border border-dark-700 shadow-xl hover:shadow-purple-500/30">
                <Zap size={20} className="group-hover:scale-110 transition-transform" />
            </button>
            <button 
                onClick={() => handleSwipe('right')}
                className="group p-4 bg-dark-800 rounded-full text-green-500 hover:bg-green-500 hover:text-white transition-all duration-300 border border-dark-700 shadow-xl hover:shadow-green-500/30"
            >
                <Heart size={28} className="group-hover:scale-110 transition-transform" fill="currentColor" />
            </button>
          </motion.div>
      )}
    </div>
  )
}
