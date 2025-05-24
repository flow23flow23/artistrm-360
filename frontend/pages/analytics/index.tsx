import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AnalyticsPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState('');
  const [artists, setArtists] = useState([]);
  const [dateRange, setDateRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchArtists = async () => {
      if (!user) return;
      
      const db = getFirestore();
      const artistsRef = collection(db, 'artists');
      const artistsQuery = query(
        artistsRef,
        where('managerId', '==', user.uid),
        orderBy('name')
      );
      
      try {
        const querySnapshot = await getDocs(artistsQuery);
        const artistsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setArtists(artistsList);
        
        if (artistsList.length > 0 && !selectedArtist) {
          setSelectedArtist(artistsList[0].id);
        }
      } catch (error) {
        console.error('Error fetching artists:', error);
      }
    };
    
    fetchArtists();
  }, [user, selectedArtist]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!user || !selectedArtist) return;
      
      setIsLoading(true);
      
      try {
        // Simulación de datos para demostración
        // En producción, estos datos vendrían de BigQuery o Firestore
        const mockData = generateMockAnalyticsData(dateRange);
        setAnalyticsData(mockData);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [user, selectedArtist, dateRange]);

  const generateMockAnalyticsData = (range) => {
    // Generar datos de ejemplo basados en el rango de fechas
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    
    // Generar etiquetas de fechas
    const labels = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    });
    
    // Datos de redes sociales
    const socialMediaData = {
      labels,
      datasets: [
        {
          label: 'Spotify',
          data: Array.from({ length: days }, () => Math.floor(Math.random() * 1000) + 500),
          borderColor: '#1DB954',
          backgroundColor: 'rgba(29, 185, 84, 0.5)',
        },
        {
          label: 'YouTube',
          data: Array.from({ length: days }, () => Math.floor(Math.random() * 2000) + 1000),
          borderColor: '#FF0000',
          backgroundColor: 'rgba(255, 0, 0, 0.5)',
        },
        {
          label: 'Instagram',
          data: Array.from({ length: days }, () => Math.floor(Math.random() * 1500) + 800),
          borderColor: '#C13584',
          backgroundColor: 'rgba(193, 53, 132, 0.5)',
        },
        {
          label: 'TikTok',
          data: Array.from({ length: days }, () => Math.floor(Math.random() * 3000) + 1500),
          borderColor: '#000000',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
      ],
    };
    
    // Datos de ingresos
    const revenueData = {
      labels,
      datasets: [
        {
          label: 'Ingresos',
          data: Array.from({ length: days }, () => Math.floor(Math.random() * 5000) + 1000),
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.5)',
          type: 'line',
        },
        {
          label: 'Gastos',
          data: Array.from({ length: days }, () => Math.floor(Math.random() * 3000) + 500),
          borderColor: '#F44336',
          backgroundColor: 'rgba(244, 67, 54, 0.5)',
          type: 'bar',
        },
      ],
    };
    
    // Datos de audiencia
    const audienceData = {
      labels: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'],
      datasets: [
        {
          label: 'Distribución por edad',
          data: [25, 35, 20, 10, 7, 3],
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
    
    // Datos geográficos
    const geoData = {
      labels: ['España', 'México', 'Argentina', 'Colombia', 'Chile', 'Otros'],
      datasets: [
        {
          label: 'Distribución geográfica',
          data: [30, 25, 15, 12, 10, 8],
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
    
    // KPIs
    const kpis = {
      totalFollowers: Math.floor(Math.random() * 1000000) + 500000,
      monthlyListeners: Math.floor(Math.random() * 500000) + 100000,
      engagement: (Math.random() * 5 + 2).toFixed(2) + '%',
      revenue: Math.floor(Math.random() * 50000) + 10000,
      growth: (Math.random() * 15 + 5).toFixed(2) + '%',
    };
    
    return {
      socialMediaData,
      revenueData,
      audienceData,
      geoData,
      kpis,
    };
  };

  if (loading || !user) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-4 md:mb-0">Analytics</h1>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              className="bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={selectedArtist}
              onChange={(e) => setSelectedArtist(e.target.value)}
            >
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.name}
                </option>
              ))}
            </select>
            
            <select
              className="bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
              <option value="1y">Último año</option>
            </select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : analyticsData ? (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <div className="bg-card rounded-xl p-6 shadow-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Seguidores Totales</h3>
                <p className="text-2xl font-bold">{analyticsData.kpis.totalFollowers.toLocaleString()}</p>
              </div>
              <div className="bg-card rounded-xl p-6 shadow-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Oyentes Mensuales</h3>
                <p className="text-2xl font-bold">{analyticsData.kpis.monthlyListeners.toLocaleString()}</p>
              </div>
              <div className="bg-card rounded-xl p-6 shadow-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Engagement</h3>
                <p className="text-2xl font-bold">{analyticsData.kpis.engagement}</p>
              </div>
              <div className="bg-card rounded-xl p-6 shadow-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Ingresos</h3>
                <p className="text-2xl font-bold">{analyticsData.kpis.revenue.toLocaleString()}€</p>
              </div>
              <div className="bg-card rounded-xl p-6 shadow-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Crecimiento</h3>
                <p className="text-2xl font-bold text-green-500">{analyticsData.kpis.growth}</p>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="mb-6 border-b border-border">
              <div className="flex overflow-x-auto">
                <button
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'overview' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'
                  }`}
                  onClick={() => setActiveTab('overview')}
                >
                  Visión General
                </button>
                <button
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'social' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'
                  }`}
                  onClick={() => setActiveTab('social')}
                >
                  Redes Sociales
                </button>
                <button
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'revenue' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'
                  }`}
                  onClick={() => setActiveTab('revenue')}
                >
                  Ingresos
                </button>
                <button
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'audience' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'
                  }`}
                  onClick={() => setActiveTab('audience')}
                >
                  Audiencia
                </button>
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {activeTab === 'overview' && (
                <>
                  <div className="bg-card rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Rendimiento en Redes Sociales</h3>
                    <div className="h-80">
                      <Chart type="line" data={analyticsData.socialMediaData} />
                    </div>
                  </div>
                  <div className="bg-card rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Ingresos vs Gastos</h3>
                    <div className="h-80">
                      <Chart type="bar" data={analyticsData.revenueData} />
                    </div>
                  </div>
                  <div className="bg-card rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Distribución por Edad</h3>
                    <div className="h-80">
                      <Chart type="pie" data={analyticsData.audienceData} />
                    </div>
                  </div>
                  <div className="bg-card rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Distribución Geográfica</h3>
                    <div className="h-80">
                      <Chart type="doughnut" data={analyticsData.geoData} />
                    </div>
                  </div>
                </>
              )}
              
              {activeTab === 'social' && (
                <>
                  <div className="bg-card rounded-xl p-6 shadow-lg lg:col-span-2">
                    <h3 className="text-xl font-bold mb-4">Rendimiento en Redes Sociales</h3>
                    <div className="h-96">
                      <Chart type="line" data={analyticsData.socialMediaData} />
                    </div>
                  </div>
                  
                  <div className="bg-card rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Plataformas Principales</h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="w-16 h-16 bg-[#1DB954] rounded-full flex items-center justify-center mr-4">
                          <span className="text-white text-2xl font-bold">S</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold">Spotify</h4>
                          <p className="text-muted-foreground">125,432 seguidores</p>
                        </div>
                        <div className="ml-auto">
                          <span className="text-green-500 font-medium">+12.5%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="w-16 h-16 bg-[#FF0000] rounded-full flex items-center justify-center mr-4">
                          <span className="text-white text-2xl font-bold">Y</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold">YouTube</h4>
                          <p className="text-muted-foreground">98,765 suscriptores</p>
                        </div>
                        <div className="ml-auto">
                          <span className="text-green-500 font-medium">+8.3%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="w-16 h-16 bg-[#C13584] rounded-full flex items-center justify-center mr-4">
                          <span className="text-white text-2xl font-bold">I</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold">Instagram</h4>
                          <p className="text-muted-foreground">87,654 seguidores</p>
                        </div>
                        <div className="ml-auto">
                          <span className="text-green-500 font-medium">+15.2%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mr-4">
                          <span className="text-white text-2xl font-bold">T</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold">TikTok</h4>
                          <p className="text-muted-foreground">156,789 seguidores</p>
                        </div>
                        <div className="ml-auto">
                          <span className="text-green-500 font-medium">+23.7%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-card rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Contenido Destacado</h3>
                    <div className="space-y-4">
                      <div className="border border-border rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center mr-2">
                            <span className="text-white text-xs font-bold">S</span>
                          </div>
                          <span className="text-sm font-medium">Spotify</span>
                        </div>
                        <h4 className="font-semibold mb-1">Nuevo Single - "Amanecer"</h4>
                        <p className="text-sm text-muted-foreground mb-2">1.2M reproducciones</p>
                        <div className="flex justify-between text-xs">
                          <span>Engagement: 8.5%</span>
                          <span className="text-green-500">+32% vs promedio</span>
                        </div>
                      </div>
                      
                      <div className="border border-border rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 bg-[#FF0000] rounded-full flex items-center justify-center mr-2">
                            <span className="text-white text-xs font-bold">Y</span>
                          </div>
                          <span className="text-sm font-medium">YouTube</span>
                        </div>
                        <h4 className="font-semibold mb-1">Video Oficial - "Amanecer"</h4>
                        <p className="text-sm text-muted-foreground mb-2">850K visualizaciones</p>
                        <div className="flex justify-between text-xs">
                          <span>Engagement: 12.3%</span>
                          <span className="text-green-500">+45% vs promedio</span>
                        </div>
                      </div>
                      
                      <div className="border border-border rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 bg-[#C13584] rounded-full flex items-center justify-center mr-2">
                            <span className="text-white text-xs font-bold">I</span>
                          </div>
                          <span className="text-sm font-medium">Instagram</span>
                        </div>
                        <h4 className="font-semibold mb-1">Anuncio de Gira 2025</h4>
                        <p className="text-sm text-muted-foreground mb-2">125K likes</p>
                        <div className="flex justify-between text-xs">
                          <span>Engagement: 15.7%</span>
                          <span className="text-green-500">+28% vs promedio</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {activeTab === 'revenue' && (
                <>
                  <div className="bg-card rounded-xl p-6 shadow-lg lg:col-span-2">
                    <h3 className="text-xl font-bold mb-4">Ingresos vs Gastos</h3>
                    <div className="h-96">
                      <Chart type="bar" data={analyticsData.revenueData} />
                    </div>
                  </div>
                  
                  <div className="bg-card rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Fuentes de Ingresos</h3>
                    <div className="h-80">
                      <Chart 
                        type="pie" 
                        data={{
                          labels: ['Streaming', 'Conciertos', 'Merchandising', 'Licencias', 'Otros'],
                          datasets: [{
                            data: [45, 30, 15, 7, 3],
                            backgroundColor: [
                              'rgba(54, 162, 235, 0.7)',
                              'rgba(255, 99, 132, 0.7)',
                              'rgba(255, 206, 86, 0.7)',
                              'rgba(75, 192, 192, 0.7)',
                              'rgba(153, 102, 255, 0.7)',
                            ],
                            borderColor: [
                              'rgba(54, 162, 235, 1)',
                              'rgba(255, 99, 132, 1)',
                              'rgba(255, 206, 86, 1)',
                              'rgba(75, 192, 192, 1)',
                              'rgba(153, 102, 255, 1)',
                            ],
                          }]
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="bg-card rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Desglose de Gastos</h3>
                    <div className="h-80">
                      <Chart 
                        type="doughnut" 
                        data={{
                          labels: ['Producción', 'Marketing', 'Equipo', 'Logística', 'Legal', 'Otros'],
                          datasets: [{
                            data: [35, 25, 20, 10, 5, 5],
                            backgroundColor: [
                              'rgba(255, 99, 132, 0.7)',
                              'rgba(54, 162, 235, 0.7)',
                              'rgba(255, 206, 86, 0.7)',
                              'rgba(75, 192, 192, 0.7)',
                              'rgba(153, 102, 255, 0.7)',
                              'rgba(255, 159, 64, 0.7)',
                            ],
                            borderColor: [
                              'rgba(255, 99, 132, 1)',
                              'rgba(54, 162, 235, 1)',
                              'rgba(255, 206, 86, 1)',
                              'rgba(75, 192, 192, 1)',
                              'rgba(153, 102, 255, 1)',
                              'rgba(255, 159, 64, 1)',
                            ],
                          }]
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
              
              {activeTab === 'audience' && (
                <>
                  <div className="bg-card rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Distribución por Edad</h3>
                    <div className="h-80">
                      <Chart type="pie" data={analyticsData.audienceData} />
                    </div>
                  </div>
                  
                  <div className="bg-card rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Distribución Geográfica</h3>
                    <div className="h-80">
                      <Chart type="doughnut" data={analyticsData.geoData} />
                    </div>
                  </div>
                  
                  <div className="bg-card rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Distribución por Género</h3>
                    <div className="h-80">
                      <Chart 
                        type="pie" 
                        data={{
                          labels: ['Femenino', 'Masculino', 'No binario', 'No especificado'],
                          datasets: [{
                            data: [55, 40, 3, 2],
                            backgroundColor: [
                              'rgba(255, 99, 132, 0.7)',
                              'rgba(54, 162, 235, 0.7)',
                              'rgba(255, 206, 86, 0.7)',
                              'rgba(75, 192, 192, 0.7)',
                            ],
                            borderColor: [
                              'rgba(255, 99, 132, 1)',
                              'rgba(54, 162, 235, 1)',
                              'rgba(255, 206, 86, 1)',
                              'rgba(75, 192, 192, 1)',
                            ],
                          }]
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="bg-card rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Dispositivos</h3>
                    <div className="h-80">
                      <Chart 
                        type="doughnut" 
                        data={{
                          labels: ['Móvil', 'Desktop', 'Tablet', 'Smart TV', 'Otros'],
                          datasets: [{
                            data: [65, 20, 10, 4, 1],
                            backgroundColor: [
                              'rgba(255, 99, 132, 0.7)',
                              'rgba(54, 162, 235, 0.7)',
                              'rgba(255, 206, 86, 0.7)',
                              'rgba(75, 192, 192, 0.7)',
                              'rgba(153, 102, 255, 0.7)',
                            ],
                            borderColor: [
                              'rgba(255, 99, 132, 1)',
                              'rgba(54, 162, 235, 1)',
                              'rgba(255, 206, 86, 1)',
                              'rgba(75, 192, 192, 1)',
                              'rgba(153, 102, 255, 1)',
                            ],
                          }]
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Recomendaciones */}
            <div className="mt-8 bg-card rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">Recomendaciones de Zeus</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border border-border rounded-lg p-4 bg-background">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-2">
                      <span className="text-white text-xs font-bold">Z</span>
                    </div>
                    <span className="text-sm font-medium">Recomendación</span>
                  </div>
                  <h4 className="font-semibold mb-2">Aumentar presencia en TikTok</h4>
                  <p className="text-sm text-muted-foreground">
                    El crecimiento en TikTok es un 23.7% superior al resto de plataformas. Recomendamos aumentar la frecuencia de publicación.
                  </p>
                </div>
                
                <div className="border border-border rounded-lg p-4 bg-background">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-2">
                      <span className="text-white text-xs font-bold">Z</span>
                    </div>
                    <span className="text-sm font-medium">Recomendación</span>
                  </div>
                  <h4 className="font-semibold mb-2">Optimizar gastos de marketing</h4>
                  <p className="text-sm text-muted-foreground">
                    Los gastos de marketing representan el 25% del total. Recomendamos optimizar la distribución hacia canales digitales con mayor ROI.
                  </p>
                </div>
                
                <div className="border border-border rounded-lg p-4 bg-background">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-2">
                      <span className="text-white text-xs font-bold">Z</span>
                    </div>
                    <span className="text-sm font-medium">Recomendación</span>
                  </div>
                  <h4 className="font-semibold mb-2">Expandir a nuevos mercados</h4>
                  <p className="text-sm text-muted-foreground">
                    Detectamos potencial de crecimiento en mercados latinoamericanos. Recomendamos estrategias específicas para Colombia y Chile.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-card rounded-xl p-6 shadow-lg">
            <p className="text-center text-muted-foreground">No hay datos disponibles para el artista seleccionado.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AnalyticsPage;
