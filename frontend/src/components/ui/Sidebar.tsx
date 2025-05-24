import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiHome, FiFolder, FiMusic, FiBarChart2, FiSettings, FiLogOut, FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-lg transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0`}>
      <div className="flex flex-col h-full">
        {/* Logo and brand */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">Artist RM</span>
            </Link>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {theme === 'dark' ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <ul className="space-y-2">
            <li>
              <Link href="/dashboard" className="nav-link">
                <FiHome className="mr-3 h-5 w-5" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/projects" className="nav-link">
                <FiFolder className="mr-3 h-5 w-5" />
                Proyectos
              </Link>
            </li>
            <li>
              <Link href="/content" className="nav-link">
                <FiMusic className="mr-3 h-5 w-5" />
                Contenido
              </Link>
            </li>
            <li>
              <Link href="/analytics" className="nav-link">
                <FiBarChart2 className="mr-3 h-5 w-5" />
                Analytics
              </Link>
            </li>
            <li>
              <Link href="/settings" className="nav-link">
                <FiSettings className="mr-3 h-5 w-5" />
                Configuración
              </Link>
            </li>
          </ul>
        </nav>

        {/* User profile and logout */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.displayName || user?.email || 'Usuario'}
              </p>
              <button
                onClick={handleLogout}
                className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center mt-1"
              >
                <FiLogOut className="mr-1 h-3 w-3" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
