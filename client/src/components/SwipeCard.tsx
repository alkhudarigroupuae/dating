"use client"
import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { X, Heart, MapPin, Info } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  age: number;
  bio: string;
  image: string;
  distance: number;
}

interface Props {
  profile: Profile;
  onSwipe: (direction: 'left' | 'right') => void;
}

export default function SwipeCard({ profile, onSwipe }: Props) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const likeOpacity = useTransform(x, [10, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, -10], [1, 0]);
  
  const [isFront, setIsFront] = useState(true);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) {
      onSwipe('right');
    } else if (info.offset.x < -100) {
      onSwipe('left');
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute top-0 left-0 w-full h-full cursor-grab active:cursor-grabbing"
    >
      <div className="relative w-full h-full bg-gray-800 rounded-3xl overflow-hidden shadow-2xl border border-gray-700">
        {/* Image */}
        <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${profile.image})` }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />

        {/* Action Indicators */}
        <motion.div style={{ opacity: likeOpacity }} className="absolute top-8 left-8 border-4 border-green-500 rounded-lg p-2 rotate-[-15deg]">
            <span className="text-green-500 font-bold text-4xl uppercase tracking-widest">Like</span>
        </motion.div>
        <motion.div style={{ opacity: nopeOpacity }} className="absolute top-8 right-8 border-4 border-red-500 rounded-lg p-2 rotate-[15deg]">
            <span className="text-red-500 font-bold text-4xl uppercase tracking-widest">Nope</span>
        </motion.div>

        {/* Info */}
        <div className="absolute bottom-0 w-full p-6 text-white">
          <div className="flex items-end justify-between mb-2">
            <div>
                <h2 className="text-3xl font-bold flex items-center gap-2">
                {profile.name}, {profile.age}
                </h2>
                <div className="flex items-center text-gray-300 text-sm mt-1">
                    <MapPin size={16} className="mr-1" />
                    {profile.distance} km away
                </div>
            </div>
            <button 
                onClick={(e) => { e.stopPropagation(); setIsFront(!isFront); }}
                className="p-2 bg-gray-800/50 rounded-full hover:bg-gray-700/50 transition-colors"
            >
                <Info size={24} />
            </button>
          </div>
          
          {/* Bio (conditionally shown or truncated) */}
          <p className="text-gray-200 line-clamp-2">{profile.bio}</p>
        </div>
      </div>
    </motion.div>
  );
}
