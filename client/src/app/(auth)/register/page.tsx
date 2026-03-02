"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { startRegistration } from '@simplewebauthn/browser';
import { Fingerprint, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Register() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: 'male'
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        // Standard Password Registration
        const { data } = await api.post('/auth/register', {
            email: formData.email,
            password: formData.password,
            name: formData.name,
            age: Number(formData.age),
            gender: formData.gender
        });

        if (data.token) {
            login(data.token, data.result);
            router.push('/matches');
        }
    } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
        setLoading(false);
    }
  };

  const handleWebAuthnRegister = async () => {
    setError('');
    setLoading(true);

    try {
      // 1. Get options from server
      const { data: options } = await api.post('/auth/webauthn/register', {
        action: 'generate-options',
        email: formData.email,
        name: formData.name,
        age: Number(formData.age),
        gender: formData.gender
      });

      // 2. Pass to browser authenticator
      const attestationResponse = await startRegistration(options);

      // 3. Verify with server
      const { data: verification } = await api.post('/auth/webauthn/register', {
        action: 'verify',
        email: formData.email,
        attestationResponse
      });

      if (verification.verified) {
        // For simplicity in this demo, we ask them to login after registration
        // or we could auto-login if the backend supported it.
        alert('Registration successful! Please login.');
        router.push('/login');
      }
    } catch (err: any) {
      console.error(err);
      setError('Biometric registration failed. Please use password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-900 text-white p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-dark-800 rounded-3xl p-8 shadow-2xl border border-dark-700"
      >
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-500">
                Create Account
            </h2>
            <p className="text-gray-400 mt-2 text-sm">Join the exclusive community</p>
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

        <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  required
                  className="w-full p-4 bg-dark-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-600"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  required
                  className="w-full p-4 bg-dark-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-600"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                <input 
                  type="password" 
                  placeholder="Password" 
                  required
                  className="w-full p-4 bg-dark-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-600"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <div className="flex gap-4">
                    <input 
                      type="number" 
                      placeholder="Age" 
                      required
                      min="18"
                      className="w-1/3 p-4 bg-dark-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-600"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                    />
                    <select 
                        className="w-2/3 p-4 bg-dark-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-gray-300"
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-orange-600 text-white p-4 rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin" /> : 'Register with Password'}
            </button>

            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-700"></div>
                <span className="flex-shrink-0 mx-4 text-gray-500 text-xs">OR USE BIOMETRICS</span>
                <div className="flex-grow border-t border-gray-700"></div>
            </div>

            <button 
                type="button"
                onClick={handleWebAuthnRegister}
                disabled={loading || !formData.email || !formData.name}
                className="w-full bg-dark-700 text-white p-4 rounded-xl font-bold border border-dark-600 hover:bg-dark-600 transition-all flex items-center justify-center gap-2"
            >
                <Fingerprint size={20} />
                Register with Face ID / Touch ID
            </button>
        </form>

        <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <button 
                    onClick={() => router.push('/login')}
                    className="text-primary hover:text-orange-500 font-semibold transition-colors"
                >
                    Login here
                </button>
            </p>
        </div>
      </motion.div>
    </div>
  );
}
