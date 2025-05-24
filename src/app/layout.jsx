import React from 'react';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';

// Componentes de layout
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FloatingZeusButton from '@/components/layout/FloatingZeusButton';

export default function RootLayout({ children }) {
  const { theme } = useTheme();
  const { user, loading } = useAuth();

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {user ? (
        // Layout para usuarios autenticados
        <div className="flex flex-col md:flex-row min-h-screen">
          <Sidebar />
          <div className="flex flex-col flex-grow">
            <Header />
            <main className="flex-grow p-4 md:p-6">
              {children}
            </main>
            <Footer />
          </div>
          <FloatingZeusButton />
        </div>
      ) : (
        // Layout para usuarios no autenticados (login, registro, etc.)
        <main className="flex-grow">
          {children}
        </main>
      )}
    </div>
  );
}
