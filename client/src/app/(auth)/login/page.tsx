"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { startAuthentication } from '@simplewebauthn/browser';
import { Fingerprint, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleWebAuthnLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // 1. Get options
      const { data: options } = await api.post('/auth/webauthn/login', {
        action: 'generate-options',
        email
      });

      // 2. Authenticate with browser
      const authenticationResponse = await startAuthentication(options);

      // 3. Verify
      const { data: verification } = await api.post('/auth/webauthn/login', {
        action: 'verify',
        email,
        authenticationResponse
      });

      if (verification.verified) {
        login(verification.token, verification.result);
        router.push('/matches');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-900 text-white p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-dark-800 rounded-3xl p-8 shadow-2xl border border-dark-700"
      >
        <div className="text-center mb-10">
            <div className="w-20 h-20 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-dark-600">
                <Fingerprint size={40} className="text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
            <p className="text-gray-400 mt-2 text-sm">Login with your biometrics</p>
        </div>
        
        {error && (
            <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 mb-6 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm text-center"
            >
                {error}
            </motion.div>
        )}

        <form onSubmit={handleWebAuthnLogin} className="space-y-6">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="w-full p-4 bg-dark-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-600 text-center text-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <button 
                type="submit" 
                disabled={loading}
                className="w-full p-4 bg-primary rounded-xl font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary-hover hover:shadow-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
                {loading ? <Loader2 className="animate-spin" /> : 'Authenticate'}
            </button>
        </form>
        
        <p className="mt-8 text-center text-gray-500 text-sm">
            Don't have an account? <a href="/register" className="text-primary hover:text-primary-hover font-medium transition-colors">Register</a>
        </p>
      </motion.div>
    </div>
  )
}
