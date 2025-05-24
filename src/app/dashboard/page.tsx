import React, { lazy, Suspense } from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton, Alert } from '@mui/material';

// Componentes de estadísticas optimizados con React.memo
const StatCard = React.memo(({ title, value, formatter = (val) => val }) => (
  <div className="stat-card">
    <h3>{title}</h3>
    <p className="stat-value">{formatter(value)}</p>
  </div>
));

// Componente de actividad reciente con carga diferida
const RecentActivity = lazy(() => import('@/components/dashboard/RecentActivity'));

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    projects: 0,
    events: 0,
    revenue: 0,
    followers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Formatters memoizados para evitar recreaciones
  const formatCurrency = useCallback((value) => {
    return `$${value.toLocaleString()}`;
  }, []);

  const formatNumber = useCallback((value) => {
    return value.toLocaleString();
  }, []);

  // Cargar datos del dashboard de forma optimizada
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const loadDashboardData = async () => {
      try {
        // Simulación de carga de datos con tiempo de espera realista
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Solo actualizar el estado si el componente sigue montado
        if (isMounted) {
          setStats({
            projects: 12,
            events: 8,
            revenue: 24500,
            followers: 45000
          });
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        if (isMounted) {
          setError('No se pudieron cargar los datos del dashboard. Intente nuevamente.');
          setIsLoading(false);
        }
      }
    };

    // Solo cargar datos si hay un usuario autenticado
    if (user) {
      loadDashboardData();
    } else {
      setIsLoading(false);
    }

    // Limpieza del efecto
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Memoizar el saludo para evitar recálculos innecesarios
  const welcomeMessage = useMemo(() => {
    return `Bienvenido de nuevo, ${user?.displayName || 'Artista'}`;
  }, [user?.displayName]);

  // Renderizado condicional basado en estado de carga y error
  if (isLoading) {
    return (
      <Layout>
        <div className="dashboard-container">
          <h1>Dashboard</h1>
          <Skeleton variant="text" width="60%" height={30} />
          
          <div className="stats-grid">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} variant="rectangular" height={120} />
            ))}
          </div>
          
          <Skeleton variant="rectangular" height={200} />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="dashboard-container">
          <h1>Dashboard</h1>
          <Alert severity="error">{error}</Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard-container">
        <h1>Dashboard</h1>
        <p>{welcomeMessage}</p>
        
        <div className="stats-grid">
          <StatCard title="Proyectos Activos" value={stats.projects} />
          <StatCard title="Próximos Eventos" value={stats.events} />
          <StatCard title="Ingresos Mensuales" value={stats.revenue} formatter={formatCurrency} />
          <StatCard title="Seguidores" value={stats.followers} formatter={formatNumber} />
        </div>
        
        <Suspense fallback={<Skeleton variant="rectangular" height={200} />}>
          <RecentActivity userId={user?.uid} />
        </Suspense>
      </div>
    </Layout>
  );
}
