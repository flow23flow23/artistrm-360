import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    projects: 0,
    events: 0,
    revenue: 0,
    followers: 0
  });

  useEffect(() => {
    // Aquí iría la lógica para cargar los datos del dashboard
    // desde Firebase o la API correspondiente
    const loadDashboardData = async () => {
      try {
        // Simulación de carga de datos
        setStats({
          projects: 12,
          events: 8,
          revenue: 24500,
          followers: 45000
        });
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
      }
    };

    loadDashboardData();
  }, [user]);

  return (
    <Layout>
      <div className="dashboard-container">
        <h1>Dashboard</h1>
        <p>Bienvenido de nuevo, {user?.displayName || 'Artista'}</p>
        
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Proyectos Activos</h3>
            <p className="stat-value">{stats.projects}</p>
          </div>
          <div className="stat-card">
            <h3>Próximos Eventos</h3>
            <p className="stat-value">{stats.events}</p>
          </div>
          <div className="stat-card">
            <h3>Ingresos Mensuales</h3>
            <p className="stat-value">${stats.revenue.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <h3>Seguidores</h3>
            <p className="stat-value">{stats.followers.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="recent-activity">
          <h2>Actividad Reciente</h2>
          {/* Lista de actividades recientes */}
        </div>
      </div>
    </Layout>
  );
}
