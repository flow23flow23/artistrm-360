import React from 'react';
import { useTheme } from '@/context/theme-context';

const Footer = () => {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`
      ${theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'} 
      border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
      py-4 px-6 text-sm
    `}>
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-2 md:mb-0">
          <p>&copy; {currentYear} ArtistRM 360. Todos los derechos reservados.</p>
        </div>
        
        <div className="flex space-x-4">
          <a href="/terms" className="hover:text-purple-500 transition-colors">
            Términos de Servicio
          </a>
          <a href="/privacy" className="hover:text-purple-500 transition-colors">
            Política de Privacidad
          </a>
          <a href="/help" className="hover:text-purple-500 transition-colors">
            Ayuda
          </a>
        </div>
        
        <div className="mt-2 md:mt-0 flex items-center">
          <span>Desarrollado por</span>
          <span className="ml-1 font-medium text-purple-500">manus.im</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
