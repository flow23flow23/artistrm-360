import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';

// Componentes
import AnalyticsSummary from '@/components/analytics/AnalyticsSummary';
import StreamingAnalytics from '@/components/analytics/StreamingAnalytics';
import SocialMediaAnalytics from '@/components/analytics/SocialMediaAnalytics';
import AudienceDemographics from '@/components/analytics/AudienceDemographics';
import RevenueAnalytics from '@/components/analytics/RevenueAnalytics';
import PerformanceComparison from '@/components/analytics/PerformanceComparison';
import AnalyticsDateRangePicker from '@/components/analytics/AnalyticsDateRangePicker';
import AnalyticsExportButton from '@/components/analytics/AnalyticsExportButton';

const Analytics = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 86400000), // 30 días atrás
    end: new Date()
  });
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'streaming', 'social', 'audience', 'revenue'

  // Cargar datos de analytics
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!user) return;
      
      try {
        // Simulación de carga de datos
        // En implementación real, estos serían llamados a Firestore, BigQuery o APIs externas
        
        // Datos simulados para el dashboard de analytics
        const mockAnalyticsData = {
          summary: {
            totalStreams: 1250000,
            monthlyListeners: 45000,
            followers: 12500,
            revenue: 3200,
            streamingGrowth: 12.5,
            listenersGrowth: 8.3,
            followersGrowth: 15.2,
            revenueGrowth: 5.7
          },
          streaming: {
            platforms: [
              { name: 'Spotify', streams: 750000, share: 60, growth: 14.2 },
              { name: 'Apple Music', streams: 250000, share: 20, growth: 10.5 },
              { name: 'YouTube Music', streams: 150000, share: 12, growth: 18.7 },
              { name: 'Amazon Music', streams: 75000, share: 6, growth: 7.3 },
              { name: 'Otros', streams: 25000, share: 2, growth: 3.1 }
            ],
            topTracks: [
              { title: 'Amanecer', streams: 350000, growth: 5.2 },
              { title: 'Noche', streams: 280000, growth: 12.8 },
              { title: 'Despertar', streams: 175000, growth: 8.5 },
              { title: 'Colaboración con DJ Max', streams: 120000, growth: 25.3 },
              { title: 'Atardecer', streams: 95000, growth: 3.7 }
            ],
            dailyStreams: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - (29 - i) * 86400000),
              streams: 30000 + Math.floor(Math.random() * 15000)
            }))
          },
          social: {
            platforms: [
              { name: 'Instagram', followers: 8500, growth: 12.3, engagement: 4.2 },
              { name: 'TikTok', followers: 6200, growth: 28.5, engagement: 7.8 },
              { name: 'YouTube', followers: 4800, growth: 8.7, engagement: 3.5 },
              { name: 'Twitter', followers: 3500, growth: 5.2, engagement: 2.1 },
              { name: 'Facebook', followers: 2800, growth: 1.5, engagement: 1.8 }
            ],
            topPosts: [
              { platform: 'TikTok', content: 'Video backstage concierto Madrid', engagement: 12500, date: new Date(Date.now() - 5 * 86400000) },
              { platform: 'Instagram', content: 'Anuncio colaboración DJ Max', engagement: 8700, date: new Date(Date.now() - 12 * 86400000) },
              { platform: 'YouTube', content: 'Videoclip Amanecer', engagement: 7500, date: new Date(Date.now() - 20 * 86400000) }
            ],
            engagementTrend: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - (29 - i) * 86400000),
              engagement: 2.5 + Math.random() * 2
            }))
          },
          audience: {
            demographics: {
              age: [
                { group: '13-17', percentage: 12 },
                { group: '18-24', percentage: 35 },
                { group: '25-34', percentage: 28 },
                { group: '35-44', percentage: 15 },
                { group: '45+', percentage: 10 }
              ],
              gender: [
                { group: 'Masculino', percentage: 48 },
                { group: 'Femenino', percentage: 51 },
                { group: 'No binario', percentage: 1 }
              ]
            },
            topLocations: [
              { country: 'España', listeners: 25000, percentage: 55.6 },
              { country: 'México', listeners: 8000, percentage: 17.8 },
              { country: 'Argentina', listeners: 4500, percentage: 10 },
              { country: 'Colombia', listeners: 3200, percentage: 7.1 },
              { country: 'Chile', listeners: 2100, percentage: 4.7 },
              { country: 'Otros', listeners: 2200, percentage: 4.8 }
            ],
            listeningHabits: {
              timeOfDay: [
                { time: 'Mañana (6-12h)', percentage: 15 },
                { time: 'Tarde (12-18h)', percentage: 30 },
                { time: 'Noche (18-24h)', percentage: 45 },
                { time: 'Madrugada (0-6h)', percentage: 10 }
              ],
              devices: [
                { device: 'Smartphone', percentage: 65 },
                { device: 'Ordenador', percentage: 20 },
                { device: 'Tablet', percentage: 8 },
                { device: 'Smart Speaker', percentage: 5 },
                { device: 'Otros', percentage: 2 }
              ]
            }
          },
          revenue: {
            sources: [
              { source: 'Streaming', amount: 1800, percentage: 56.3 },
              { source: 'Descargas', amount: 350, percentage: 10.9 },
              { source: 'Licencias', amount: 650, percentage: 20.3 },
              { source: 'Merchandising', amount: 400, percentage: 12.5 }
            ],
            monthlyRevenue: Array.from({ length: 12 }, (_, i) => ({
              month: new Date(Date.now() - (11 - i) * 30 * 86400000),
              amount: 2500 + Math.floor(Math.random() * 1500)
            })),
            platformRevenue: [
              { platform: 'Spotify', amount: 1200, growth: 8.5 },
              { platform: 'Apple Music', amount: 450, growth: 12.3 },
              { platform: 'YouTube Music', amount: 250, growth: 15.7 },
              { platform: 'Amazon Music', amount: 150, growth: 5.2 },
              { platform: 'Otros', amount: 100, growth: 3.8 }
            ]
          }
        };
        
        setAnalyticsData(mockAnalyticsData);
      } catch (error) {
        console.error('Error al cargar datos de analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [user, dateRange]);

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Analytics</h1>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Analiza el rendimiento de tu música y tu presencia en redes sociales.
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <AnalyticsDateRangePicker 
            dateRange={dateRange} 
            onDateRangeChange={handleDateRangeChange} 
          />
          <AnalyticsExportButton />
        </div>
      </div>

      {/* Pestañas de navegación */}
      <div className="mb-8 border-b border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => handleTabChange('overview')}
            className={`pb-4 px-1 ${
              activeTab === 'overview'
                ? 'border-b-2 border-purple-500 text-purple-500'
                : `${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} hover:text-purple-500`
            } font-medium transition-colors`}
          >
            Resumen
          </button>
          <button
            onClick={() => handleTabChange('streaming')}
            className={`pb-4 px-1 ${
              activeTab === 'streaming'
                ? 'border-b-2 border-purple-500 text-purple-500'
                : `${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} hover:text-purple-500`
            } font-medium transition-colors`}
          >
            Streaming
          </button>
          <button
            onClick={() => handleTabChange('social')}
            className={`pb-4 px-1 ${
              activeTab === 'social'
                ? 'border-b-2 border-purple-500 text-purple-500'
                : `${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} hover:text-purple-500`
            } font-medium transition-colors`}
          >
            Redes Sociales
          </button>
          <button
            onClick={() => handleTabChange('audience')}
            className={`pb-4 px-1 ${
              activeTab === 'audience'
                ? 'border-b-2 border-purple-500 text-purple-500'
                : `${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} hover:text-purple-500`
            } font-medium transition-colors`}
          >
            Audiencia
          </button>
          <button
            onClick={() => handleTabChange('revenue')}
            className={`pb-4 px-1 ${
              activeTab === 'revenue'
                ? 'border-b-2 border-purple-500 text-purple-500'
                : `${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} hover:text-purple-500`
            } font-medium transition-colors`}
          >
            Ingresos
          </button>
        </nav>
      </div>

      {/* Contenido según pestaña activa */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <AnalyticsSummary data={analyticsData.summary} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StreamingAnalytics data={analyticsData.streaming} compact={true} />
            <SocialMediaAnalytics data={analyticsData.social} compact={true} />
          </div>
          <PerformanceComparison 
            streamingData={analyticsData.streaming} 
            socialData={analyticsData.social} 
            revenueData={analyticsData.revenue} 
          />
        </div>
      )}

      {activeTab === 'streaming' && (
        <StreamingAnalytics data={analyticsData.streaming} />
      )}

      {activeTab === 'social' && (
        <SocialMediaAnalytics data={analyticsData.social} />
      )}

      {activeTab === 'audience' && (
        <AudienceDemographics data={analyticsData.audience} />
      )}

      {activeTab === 'revenue' && (
        <RevenueAnalytics data={analyticsData.revenue} />
      )}
    </div>
  );
};

export default Analytics;
