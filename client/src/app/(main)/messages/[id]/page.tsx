"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Send, Phone, Video, MoreVertical, Image as ImageIcon, Smile, ArrowLeft, Check, CheckCheck } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { motion } from 'framer-motion';

interface Message {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  createdAt: string;
}

export default function Chat({ params }: { params: { id: string } }) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const receiverId = params.id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data } = await api.get(`/messages/${receiverId}`);
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); 
    return () => clearInterval(interval);
  }, [receiverId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageData = {
        sender: user._id,
        receiver: receiverId,
        content: newMessage,
        createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, { ...messageData, _id: 'temp-' + Date.now() }]);
    setNewMessage('');

    try {
        await api.post('/messages', {
            receiverId,
            content: messageData.content
        });
    } catch (error) {
        console.error("Failed to send message", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark-900">
      {/* Header */}
      <header className="px-4 py-3 bg-dark-800/80 backdrop-blur-md border-b border-dark-700 flex justify-between items-center z-10 sticky top-0">
        <div className="flex items-center gap-3">
            <Link href="/messages" className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white rounded-full hover:bg-dark-700 transition-colors">
                <ArrowLeft size={20} />
            </Link>
            <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-500 rounded-full shadow-lg" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-dark-800 rounded-full shadow-sm"></div>
            </div>
            <div>
                <h3 className="font-bold text-white text-sm">Chat</h3>
                <p className="text-[10px] text-green-500 font-medium tracking-wide">ONLINE</p>
            </div>
        </div>
        <div className="flex gap-2">
            <button className="p-2.5 hover:bg-dark-700 rounded-full transition-colors text-gray-400 hover:text-primary"><Phone size={20} /></button>
            <button className="p-2.5 hover:bg-dark-700 rounded-full transition-colors text-gray-400 hover:text-primary"><Video size={20} /></button>
            <button className="p-2.5 hover:bg-dark-700 rounded-full transition-colors text-gray-400 hover:text-white"><MoreVertical size={20} /></button>
        </div>
      </header>
      
      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-dark-900 scroll-smooth">
        {messages.map((msg, index) => {
            const isMe = msg.sender === user?._id;
            const isLast = index === messages.length - 1;
            
            return (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg._id} 
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                    <div 
                        className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${
                            isMe 
                            ? 'bg-primary text-white rounded-br-none' 
                            : 'bg-dark-800 text-gray-100 rounded-bl-none border border-dark-700'
                        }`}
                    >
                        <p className="text-[15px] leading-relaxed">{msg.content}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1 opacity-70`}>
                            <p className="text-[10px]">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {isMe && <CheckCheck size={12} />}
                        </div>
                    </div>
                </motion.div>
            );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-dark-800 border-t border-dark-700">
          <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto">
            <button type="button" className="p-3 text-gray-400 hover:text-primary transition-colors hover:bg-dark-700 rounded-full">
                <ImageIcon size={22} />
            </button>
            <div className="flex-1 relative">
                <input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="w-full py-3 pl-5 pr-12 bg-dark-700 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 border border-transparent focus:border-primary/30 transition-all placeholder:text-gray-500"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="button" className="absolute right-3 top-3 text-gray-400 hover:text-yellow-400 transition-colors">
                    <Smile size={20} />
                </button>
            </div>
            <button 
                type="submit" 
                disabled={!newMessage.trim()}
                className="p-3 bg-primary rounded-full text-white shadow-lg shadow-primary/20 hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all hover:scale-105 active:scale-95"
            >
                <Send size={20} className={newMessage.trim() ? 'ml-0.5' : ''} />
            </button>
          </form>
      </div>
    </div>
  )
}
