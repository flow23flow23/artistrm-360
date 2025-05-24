'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthForm from '@/components/auth/AuthForm';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zam-bg-primary">
        <Loader2 className="h-8 w-8 animate-spin text-zam-accent-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zam-bg-primary">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-zam-accent-primary/5 via-transparent to-zam-accent-secondary/5" />
      
      <div className="relative z-10 flex min-h-screen">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
          <div className="max-w-md space-y-8">
            <div>
              <h1 className="text-5xl font-bold text-zam-text-primary mb-4">
                ArtistRM <span className="text-gradient">360</span>
              </h1>
              <p className="text-xl text-zam-text-secondary">
                Your complete music career management platform
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-zam-accent-primary/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-zam-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zam-text-primary">Project Management</h3>
                  <p className="text-zam-text-tertiary">Organize albums, singles, tours, and collaborations in one place</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-zam-accent-secondary/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-zam-accent-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zam-text-primary">Advanced Analytics</h3>
                  <p className="text-zam-text-tertiary">Track performance across all platforms with unified insights</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-zam-accent-tertiary/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-zam-accent-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zam-text-primary">Zeus AI Assistant</h3>
                  <p className="text-zam-text-tertiary">Your intelligent companion for insights and automation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <AuthForm />
          </div>
        </div>
      </div>
    </div>
  );
}