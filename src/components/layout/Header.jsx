import React from 'react';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';

const Header = () => {
  const { user, userData, logout } = useAuth();
  const { theme } = useTheme();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showProfile, setShowProfile] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showProfile) setShowProfile(false);
  };

  const toggleProfile = () => {
    setShowProfile(!showProfile);
    if (showNotifications) setShowNotifications(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implementar búsqueda
    console.log('Búsqueda:', searchQuery);
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Redirigir a página de login se maneja automáticamente por el AuthContext
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <header className={`
      ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} 
      border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
      py-3 px-6 flex items-center justify-between
      sticky top-0 z-10
    `}>
      {/* Título de la página (se puede hacer dinámico) */}
      <h1 className="text-xl font-semibold hidden md:block">Dashboard</h1>

      <div className="flex items-center space-x-4">
        {/* Barra de búsqueda */}
        <form onSubmit={handleSearch} className="relative hidden md:block">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`
              rounded-full py-2 pl-10 pr-4 w-64
              ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}
              focus:outline-none focus:ring-2 focus:ring-purple-500
            `}
          />
          <span className="material-icons absolute left-3 top-2 text-gray-400">search</span>
        </form>

        {/* Botón de notificaciones */}
        <div className="relative">
          <button
            onClick={toggleNotifications}
            className={`
              p-2 rounded-full relative
              ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
              focus:outline-none
            `}
          >
            <span className="material-icons">notifications</span>
            {/* Indicador de notificaciones */}
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Panel de notificaciones */}
          {showNotifications && (
            <div className={`
              absolute right-0 mt-2 w-80 rounded-md shadow-lg
              ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}
              border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
              z-20
            `}>
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-medium">Notificaciones</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {/* Lista de notificaciones */}
                <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} hover:bg-gray-700`}>
                  <p className="font-medium">Nuevo comentario</p>
                  <p className="text-sm text-gray-400">Juan ha comentado en tu proyecto "Álbum 2023"</p>
                  <p className="text-xs text-gray-500 mt-1">Hace 5 minutos</p>
                </div>
                <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} hover:bg-gray-700`}>
                  <p className="font-medium">Recordatorio de evento</p>
                  <p className="text-sm text-gray-400">Concierto en Madrid mañana a las 20:00</p>
                  <p className="text-xs text-gray-500 mt-1">Hace 1 hora</p>
                </div>
                <div className={`p-4 hover:bg-gray-700`}>
                  <p className="font-medium">Actualización de plataforma</p>
                  <p className="text-sm text-gray-400">Se ha lanzado una nueva versión de ArtistRM</p>
                  <p className="text-xs text-gray-500 mt-1">Hace 1 día</p>
                </div>
              </div>
              <div className="p-2 text-center border-t border-gray-700">
                <button className="text-purple-500 hover:text-purple-400 text-sm">
                  Ver todas las notificaciones
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Perfil de usuario */}
        <div className="relative">
          <button
            onClick={toggleProfile}
            className="flex items-center focus:outline-none"
          >
            <img
              src={userData?.photoURL || '/default-avatar.png'}
              alt="Avatar"
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="ml-2 hidden md:block">{userData?.displayName || 'Usuario'}</span>
            <span className="material-icons ml-1">arrow_drop_down</span>
          </button>

          {/* Menú de perfil */}
          {showProfile && (
            <div className={`
              absolute right-0 mt-2 w-48 rounded-md shadow-lg
              ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}
              border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
              z-20
            `}>
              <div className="py-1">
                <a href="/profile" className={`block px-4 py-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <span className="material-icons mr-2 align-middle text-sm">person</span>
                  Mi Perfil
                </a>
                <a href="/settings" className={`block px-4 py-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <span className="material-icons mr-2 align-middle text-sm">settings</span>
                  Configuración
                </a>
                <a href="/help" className={`block px-4 py-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <span className="material-icons mr-2 align-middle text-sm">help</span>
                  Ayuda
                </a>
                <button 
                  onClick={handleLogout}
                  className={`block w-full text-left px-4 py-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} text-red-500`}
                >
                  <span className="material-icons mr-2 align-middle text-sm">exit_to_app</span>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
