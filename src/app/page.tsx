'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.session) {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-fog overflow-hidden">
      {/* Left side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 relative z-10">
        
        {/* Logo/Brand */}
        <div className="absolute top-8 left-8 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-coral to-brand-purple flex items-center justify-center text-white font-bold text-xl">
            P
          </div>
          <span className="font-bold text-xl tracking-wide text-obsidian">PEACHY</span>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md bg-white rounded-2xl p-10 shadow-lg border border-silver-soft">
          <h1 className="text-4xl font-bold mb-2 text-obsidian">
            Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-coral to-brand-purple">back</span>
          </h1>
          <p className="text-silver-dark mb-8 text-sm">Sign in to your account to continue</p>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-obsidian mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-silver-medium" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="block w-full pl-10 pr-3 py-3 border border-silver-soft rounded-lg focus:ring-brand-purple focus:border-brand-purple sm:text-sm outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-obsidian">Password</label>
                <Link href="#" className="text-xs font-medium text-brand-purple hover:text-brand-deep-purple">
                  Forgot your password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-silver-medium" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-10 py-3 border border-silver-soft rounded-lg focus:ring-brand-purple focus:border-brand-purple sm:text-sm outline-none transition-colors"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium btn-primary disabled:opacity-70"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            
            <div className="relative mt-8 mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-silver-soft"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-silver-dark">Or sign in with</span>
              </div>
            </div>

            <div className="space-y-3">
              <button type="button" className="w-full flex items-center justify-center px-4 py-2.5 border border-silver-soft rounded-lg shadow-sm bg-white text-sm font-medium text-obsidian hover:bg-gray-50 transition-colors">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5 mr-2" alt="Google" />
                Continue with Google
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right side: Image concept */}
      <div className="hidden lg:block lg:w-1/2 relative bg-white">
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/hourglass.png"
            alt="Hourglass Concept"
            fill
            className="object-cover object-center"
            priority
          />
        </div>
      </div>
    </div>
  );
}
