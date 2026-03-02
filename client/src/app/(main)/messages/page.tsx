"use client"
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, MessageCircle } from 'lucide-react';
import api from '@/lib/api';
import { motion } from 'framer-motion';

interface Match {
  id: string;
  user: {
    _id: string;
    name: string;
    photos: string[];
  };
  createdAt: string;
}

export default function Messages() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data } = await api.get('/matches');
      setMatches(data);
    } catch (error) {
      console.error("Failed to fetch matches", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-dark-900">
      <div className="p-4 pt-6 border-b border-dark-800">
        <h1 className="text-3xl font-bold text-white mb-6">Messages</h1>
        
        {/* Search */}
        <div className="relative group">
            <Search className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
            <input 
                type="text" 
                placeholder="Search matches" 
                className="w-full bg-dark-800 text-white rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-600"
            />
        </div>
      </div>

      {/* Match Queue (Horizontal Scroll) - New Matches */}
      <div className="p-5 border-b border-dark-800">
        <h2 className="text-xs font-bold text-primary uppercase tracking-widest mb-4">New Matches</h2>
        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
            {matches.map((match, i) => (
                <Link href={`/messages/${match.user._id}`} key={match.id}>
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex flex-col items-center min-w-[70px] group"
                    >
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-orange-500 p-[3px] shadow-lg group-hover:scale-105 transition-transform">
                            <img 
                                src={match.user.photos[0] || 'https://via.placeholder.com/100'} 
                                alt={match.user.name}
                                className="w-full h-full rounded-full border-2 border-dark-900 object-cover" 
                            />
                        </div>
                        <span className="text-sm text-gray-300 mt-2 font-medium truncate w-20 text-center group-hover:text-white transition-colors">{match.user.name}</span>
                    </motion.div>
                </Link>
            ))}
            {matches.length === 0 && <p className="text-gray-600 text-sm italic">No matches yet. Start swiping!</p>}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {matches.map((match, i) => (
            <Link 
                key={match.id} 
                href={`/messages/${match.user._id}`} 
            >
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-4 hover:bg-dark-800 transition-colors border-b border-dark-800/50 cursor-pointer"
                >
                    <div className="relative">
                        <img 
                            src={match.user.photos[0] || 'https://via.placeholder.com/100'} 
                            alt={match.user.name} 
                            className="w-16 h-16 rounded-full object-cover border border-dark-700" 
                        />
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-dark-900"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-bold text-white text-lg">{match.user.name}</h3>
                            <span className="text-xs text-gray-500 font-medium">{new Date(match.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm truncate text-gray-400 flex items-center gap-1">
                            <MessageCircle size={14} />
                            Start a conversation!
                        </p>
                    </div>
                </motion.div>
            </Link>
        ))}
      </div>
    </div>
  )
}
