import React, { useState } from 'react';
import { FiMenu, FiBell, FiSearch, FiMic } from 'react-icons/fi';
import Link from 'next/link';

interface HeaderProps {
  toggleSidebar: () => void;
  toggleZeus: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, toggleZeus }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Nuevo comentario en tu proyecto', time: '5 min' },
    { id: 2, text: 'Actualización de plataforma completada', time: '1 hora' },
    { id: 3, text: 'Nuevo seguidor en Spotify', time: '3 horas' }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // Implementar búsqueda real
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section */}
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 md:hidden"
            >
              <FiMenu className="h-6 w-6" />
            </button>
            <div className="ml-4 md:ml-0">
              <form onSubmit={handleSearch} className="hidden md:flex items-center">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-input pl-10 pr-4 py-2 w-64 rounded-md"
                  />
                </div>
                <button type="submit" className="hidden">Buscar</button>
              </form>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Zeus voice command button */}
            <button
              onClick={toggleZeus}
              className="p-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm hover:from-indigo-700 hover:to-purple-700 transition-colors"
              aria-label="Zeus IA"
            >
              <FiMic className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={toggleNotifications}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 relative"
                aria-label="Notificaciones"
              >
                <FiBell className="h-6 w-6" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 transform translate-x-1 -translate-y-1"></span>
                )}
              </button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700 animate-fade-in">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Notificaciones</h3>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <Link 
                          href="#" 
                          key={notification.id}
                          className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-start">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 dark:text-white">{notification.text}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Hace {notification.time}</p>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        No hay notificaciones nuevas
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                    <Link href="/notifications" className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      Ver todas las notificaciones
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
