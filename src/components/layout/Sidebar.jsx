import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';

// Iconos (importar de @mui/icons-material en implementación real)
const DashboardIcon = () => <span className="material-icons">dashboard</span>;
const ProjectsIcon = () => <span className="material-icons">folder</span>;
const ContentIcon = () => <span className="material-icons">perm_media</span>;
const AnalyticsIcon = () => <span className="material-icons">analytics</span>;
const FinancesIcon = () => <span className="material-icons">attach_money</span>;
const EventsIcon = () => <span className="material-icons">event</span>;
const ContractsIcon = () => <span className="material-icons">description</span>;
const FansIcon = () => <span className="material-icons">people</span>;
const SettingsIcon = () => <span className="material-icons">settings</span>;

const Sidebar = () => {
  const { userData } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = React.useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const menuItems = [
    { name: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { name: 'Proyectos', icon: <ProjectsIcon />, path: '/projects' },
    { name: 'Contenido', icon: <ContentIcon />, path: '/content' },
    { name: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
    { name: 'Finanzas', icon: <FinancesIcon />, path: '/finances' },
    { name: 'Eventos', icon: <EventsIcon />, path: '/events' },
    { name: 'Contratos', icon: <ContractsIcon />, path: '/contracts' },
    { name: 'Fans', icon: <FansIcon />, path: '/fans' },
    { name: 'Configuración', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <aside 
      className={`
        ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} 
        ${collapsed ? 'w-16' : 'w-64'} 
        transition-all duration-300 ease-in-out 
        fixed h-full left-0 top-0 
        md:relative 
        shadow-lg
        z-10
      `}
    >
      {/* Logo y botón de colapsar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center">
          <img 
            src="/logo.png" 
            alt="ArtistRM 360" 
            className="h-8 w-auto" 
          />
          {!collapsed && (
            <span className="ml-2 text-xl font-semibold">ArtistRM</span>
          )}
        </div>
        <button 
          onClick={toggleSidebar}
          className="p-1 rounded-full hover:bg-gray-700 focus:outline-none"
        >
          <span className="material-icons">
            {collapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </div>

      {/* Perfil de usuario */}
      <div className={`p-4 border-b border-gray-700 ${collapsed ? 'text-center' : ''}`}>
        <div className="flex items-center">
          <img 
            src={userData?.photoURL || '/default-avatar.png'} 
            alt="Avatar" 
            className="h-10 w-10 rounded-full object-cover"
          />
          {!collapsed && (
            <div className="ml-3">
              <p className="font-medium">{userData?.displayName || 'Usuario'}</p>
              <p className="text-sm text-gray-400">{userData?.role || 'Artista'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Menú de navegación */}
      <nav className="mt-4">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path}>
                <a className={`
                  flex items-center px-4 py-3
                  ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
                  transition-colors duration-200
                  rounded-lg mx-2 my-1
                `}>
                  <span className="text-purple-500">{item.icon}</span>
                  {!collapsed && (
                    <span className="ml-3">{item.name}</span>
                  )}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Botón de tema */}
      <div className="absolute bottom-4 w-full flex justify-center">
        <button 
          onClick={toggleTheme}
          className={`
            p-2 rounded-full 
            ${theme === 'dark' ? 'bg-gray-700 text-yellow-400' : 'bg-gray-200 text-gray-800'}
            focus:outline-none
          `}
        >
          <span className="material-icons">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
