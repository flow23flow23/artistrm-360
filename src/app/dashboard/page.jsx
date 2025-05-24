import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// Componentes
import StatCard from '@/components/dashboard/StatCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import UpcomingEvents from '@/components/dashboard/UpcomingEvents';
import ProjectStatus from '@/components/dashboard/ProjectStatus';
import StreamingChart from '@/components/dashboard/StreamingChart';
import SocialMediaChart from '@/components/dashboard/SocialMediaChart';

const Dashboard = () => {
  const { theme } = useTheme();
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStreams: 0,
    monthlyListeners: 0,
    followers: 0,
    revenue: 0
  });
  const [activities, setActivities] = useState([]);
  const [events, setEvents] = useState([]);
  const [projects, setProjects] = useState([]);

  // Cargar datos del dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        // Simulación de carga de datos
        // En implementación real, estos serían llamados a Firestore
        
        // Estadísticas
        setStats({
          totalStreams: 1250000,
          monthlyListeners: 45000,
          followers: 12500,
          revenue: 3200
        });
        
        // Actividades recientes
        const mockActivities = [
          { id: 1, type: 'comment', content: 'Juan comentó en tu proyecto "Álbum 2023"', timestamp: new Date(Date.now() - 5 * 60000) },
          { id: 2, type: 'stream', content: 'Tu canción "Amanecer" alcanzó 10,000 reproducciones', timestamp: new Date(Date.now() - 3 * 3600000) },
          { id: 3, type: 'follower', content: 'Ganaste 100 nuevos seguidores en Instagram', timestamp: new Date(Date.now() - 1 * 86400000) },
          { id: 4, type: 'revenue', content: 'Recibiste un pago de $500 por regalías', timestamp: new Date(Date.now() - 2 * 86400000) }
        ];
        setActivities(mockActivities);
        
        // Próximos eventos
        const mockEvents = [
          { id: 1, title: 'Concierto en Madrid', location: 'Sala Sol, Madrid', date: new Date(Date.now() + 2 * 86400000), type: 'concert' },
          { id: 2, title: 'Entrevista Radio Nacional', location: 'Estudio 5, Barcelona', date: new Date(Date.now() + 5 * 86400000), type: 'interview' },
          { id: 3, title: 'Sesión de fotos', location: 'Estudio Luz, Valencia', date: new Date(Date.now() + 7 * 86400000), type: 'photoshoot' }
        ];
        setEvents(mockEvents);
        
        // Proyectos
        const mockProjects = [
          { id: 1, title: 'Álbum 2023', progress: 75, status: 'in-progress', dueDate: new Date(Date.now() + 30 * 86400000) },
          { id: 2, title: 'Videoclip "Amanecer"', progress: 90, status: 'in-progress', dueDate: new Date(Date.now() + 10 * 86400000) },
          { id: 3, title: 'Gira Nacional', progress: 40, status: 'in-progress', dueDate: new Date(Date.now() + 60 * 86400000) }
        ];
        setProjects(mockProjects);
        
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Bienvenido, {userData?.displayName || 'Artista'}</h1>
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Aquí tienes un resumen de tu actividad reciente y próximos eventos.
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Streams" 
          value={stats.totalStreams.toLocaleString()} 
          icon="play_circle" 
          change={+12.5} 
          color="blue"
        />
        <StatCard 
          title="Oyentes Mensuales" 
          value={stats.monthlyListeners.toLocaleString()} 
          icon="people" 
          change={+8.3} 
          color="green"
        />
        <StatCard 
          title="Seguidores" 
          value={stats.followers.toLocaleString()} 
          icon="person_add" 
          change={+15.2} 
          color="purple"
        />
        <StatCard 
          title="Ingresos Mensuales" 
          value={`$${stats.revenue.toLocaleString()}`} 
          icon="attach_money" 
          change={+5.7} 
          color="amber"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className={`rounded-lg shadow-md overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-medium">Reproducciones por Plataforma</h2>
          </div>
          <div className="p-4">
            <StreamingChart />
          </div>
        </div>
        <div className={`rounded-lg shadow-md overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-medium">Seguidores en Redes Sociales</h2>
          </div>
          <div className="p-4">
            <SocialMediaChart />
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actividad reciente */}
        <div className={`rounded-lg shadow-md overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-medium">Actividad Reciente</h2>
          </div>
          <div className="p-4">
            <ActivityFeed activities={activities} />
          </div>
        </div>

        {/* Próximos eventos */}
        <div className={`rounded-lg shadow-md overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-medium">Próximos Eventos</h2>
          </div>
          <div className="p-4">
            <UpcomingEvents events={events} />
          </div>
        </div>

        {/* Estado de proyectos */}
        <div className={`rounded-lg shadow-md overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-medium">Estado de Proyectos</h2>
          </div>
          <div className="p-4">
            <ProjectStatus projects={projects} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
