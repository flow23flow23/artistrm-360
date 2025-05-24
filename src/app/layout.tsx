import '@/styles/globals.css';
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/context/theme-context';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Artist RM - Tu Plataforma 360 de Road Management Artístico',
  description: 'Gestión integral para artistas y managers musicales',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
