import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'ArtistRM 360 - Artist Career Management Platform',
  description: 'Comprehensive SaaS platform for managing your music career with AI-powered insights, project management, analytics, and more.',
  keywords: 'artist management, music career, project management, analytics, AI assistant',
  authors: [{ name: 'ArtistRM Team' }],
  creator: 'ArtistRM',
  publisher: 'ArtistRM',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'ArtistRM 360 - Artist Career Management Platform',
    description: 'Comprehensive SaaS platform for managing your music career',
    url: 'https://artistrm360.com',
    siteName: 'ArtistRM 360',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ArtistRM 360',
    description: 'Comprehensive SaaS platform for managing your music career',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: '#0f0f0f',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f1f1f',
                color: '#ffffff',
                border: '1px solid #333333',
              },
              success: {
                iconTheme: {
                  primary: '#00ff66',
                  secondary: '#0f0f0f',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ff3333',
                  secondary: '#0f0f0f',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}