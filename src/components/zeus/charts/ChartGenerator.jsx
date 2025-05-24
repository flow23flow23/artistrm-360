// Archivo: /home/ubuntu/artistrm-360-github/src/components/zeus/charts/ChartGenerator.jsx

import React, { useMemo } from 'react';
import MetricsChart from './MetricsChart';

/**
 * Componente generador de gráficos para Zeus IA
 * 
 * Este componente analiza los datos del artista y genera
 * visualizaciones relevantes según el tipo de consulta y los datos disponibles.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.artistData - Datos completos del artista
 * @param {string} props.queryType - Tipo de consulta (events, releases, social_media, streaming, etc.)
 * @param {Object} props.entities - Entidades detectadas en la consulta
 * @param {string} props.intent - Intención detectada en la consulta
 */
const ChartGenerator = ({
  artistData,
  queryType,
  entities = {},
  intent
}) => {
  // Determinar qué gráficos mostrar según el tipo de consulta e intención
  const chartConfigs = useMemo(() => {
    if (!artistData) return [];
    
    const configs = [];
    
    // Gráficos para streaming
    if (queryType === 'streaming' || entities.contentTypes?.includes('streams')) {
      // Verificar si hay datos de streaming disponibles
      if (artistData.streamingStats?.raw) {
        const platforms = Object.keys(artistData.streamingStats.raw);
        
        if (platforms.length > 0) {
          // Preparar datos para gráfico de streams por plataforma
          const streamsByPlatform = [];
          
          platforms.forEach(platform => {
            const platformData = artistData.streamingStats.raw[platform];
            
            platformData.forEach(dataPoint => {
              const existingPoint = streamsByPlatform.find(
                point => point.date === dataPoint.date?.toISOString().split('T')[0]
              );
              
              if (existingPoint) {
                existingPoint[platform] = dataPoint.streams || 0;
              } else {
                const newPoint = {
                  date: dataPoint.date?.toISOString().split('T')[0]
                };
                newPoint[platform] = dataPoint.streams || 0;
                streamsByPlatform.push(newPoint);
              }
            });
          });
          
          // Ordenar por fecha
          streamsByPlatform.sort((a, b) => new Date(a.date) - new Date(b.date));
          
          // Añadir configuración del gráfico
          configs.push({
            title: 'Reproducciones por plataforma',
            type: 'line',
            data: streamsByPlatform,
            dataKey: platforms[0],
            compareKeys: platforms.slice(1),
            xAxisKey: 'date',
            color: '#8884d8',
            customTooltip: {
              formatter: (value) => value.toLocaleString()
            }
          });
          
          // Gráfico de distribución de streams
          if (artistData.streamingStats.streamDistribution) {
            const distributionData = Object.keys(artistData.streamingStats.streamDistribution).map(platform => ({
              name: platform,
              value: artistData.streamingStats.streamDistribution[platform]
            }));
            
            configs.push({
              title: 'Distribución de reproducciones',
              type: 'bar',
              data: distributionData,
              dataKey: 'value',
              xAxisKey: 'name',
              color: '#82ca9d',
              customTooltip: {
                formatter: (value) => `${value.toFixed(1)}%`
              }
            });
          }
        }
      }
    }
    
    // Gráficos para redes sociales
    if (queryType === 'social_media' || entities.contentTypes?.includes('followers') || entities.contentTypes?.includes('engagement')) {
      // Verificar si hay datos de redes sociales disponibles
      if (artistData.socialMetrics?.raw) {
        const platforms = Object.keys(artistData.socialMetrics.raw);
        
        if (platforms.length > 0) {
          // Para cada plataforma, crear gráfico de seguidores
          platforms.forEach(platform => {
            const platformData = artistData.socialMetrics.raw[platform];
            
            if (platformData.length > 0) {
              // Preparar datos para gráfico de seguidores
              const followersData = platformData.map(dataPoint => ({
                date: dataPoint.date?.toISOString().split('T')[0],
                followers: dataPoint.followers || 0,
                engagement: dataPoint.engagement || 0
              }));
              
              // Ordenar por fecha
              followersData.sort((a, b) => new Date(a.date) - new Date(b.date));
              
              // Añadir configuración del gráfico
              configs.push({
                title: `Seguidores en ${platform}`,
                type: 'area',
                data: followersData,
                dataKey: 'followers',
                xAxisKey: 'date',
                color: platform === 'instagram' ? '#E1306C' : 
                       platform === 'tiktok' ? '#69C9D0' : 
                       platform === 'youtube' ? '#FF0000' : 
                       platform === 'spotify' ? '#1DB954' : '#8884d8',
                customTooltip: {
                  formatter: (value) => value.toLocaleString()
                }
              });
              
              // Gráfico de engagement si hay datos suficientes
              if (followersData.some(d => d.engagement > 0)) {
                configs.push({
                  title: `Engagement en ${platform}`,
                  type: 'line',
                  data: followersData,
                  dataKey: 'engagement',
                  xAxisKey: 'date',
                  color: '#ff7300',
                  customTooltip: {
                    formatter: (value) => value.toLocaleString()
                  }
                });
              }
            }
          });
          
          // Gráfico comparativo de crecimiento si hay datos de tendencias
          if (artistData.socialMetrics.growthPercentages) {
            const growthData = Object.keys(artistData.socialMetrics.growthPercentages).map(platform => ({
              name: platform,
              followers: artistData.socialMetrics.growthPercentages[platform].followers,
              engagement: artistData.socialMetrics.growthPercentages[platform].engagement
            }));
            
            configs.push({
              title: 'Crecimiento por plataforma (%)',
              type: 'bar',
              data: growthData,
              dataKey: 'followers',
              compareKeys: ['engagement'],
              xAxisKey: 'name',
              color: '#8884d8',
              customTooltip: {
                formatter: (value) => `${value.toFixed(1)}%`
              }
            });
          }
        }
      }
    }
    
    // Gráficos para eventos
    if (queryType === 'events') {
      // Verificar si hay datos de eventos disponibles
      if (artistData.events) {
        const { past, upcoming } = artistData.events;
        
        if (past.length > 0) {
          // Agrupar eventos pasados por mes
          const eventsByMonth = {};
          
          past.forEach(event => {
            const monthYear = event.date.toISOString().substring(0, 7); // YYYY-MM
            if (!eventsByMonth[monthYear]) {
              eventsByMonth[monthYear] = 0;
            }
            eventsByMonth[monthYear]++;
          });
          
          // Convertir a array para el gráfico
          const eventCountData = Object.keys(eventsByMonth).map(monthYear => ({
            month: monthYear,
            count: eventsByMonth[monthYear]
          }));
          
          // Ordenar por fecha
          eventCountData.sort((a, b) => a.month.localeCompare(b.month));
          
          // Añadir configuración del gráfico
          configs.push({
            title: 'Eventos por mes',
            type: 'bar',
            data: eventCountData,
            dataKey: 'count',
            xAxisKey: 'month',
            color: '#82ca9d',
            customTooltip: {
              formatter: (value) => value.toString()
            }
          });
          
          // Gráfico de asistencia si hay datos
          if (past.some(event => event.attendance)) {
            const attendanceData = past
              .filter(event => event.attendance)
              .map(event => ({
                date: event.date.toISOString().split('T')[0],
                name: event.name,
                attendance: event.attendance
              }))
              .sort((a, b) => new Date(a.date) - new Date(b.date));
            
            configs.push({
              title: 'Asistencia a eventos',
              type: 'line',
              data: attendanceData,
              dataKey: 'attendance',
              xAxisKey: 'date',
              color: '#8884d8',
              customTooltip: {
                formatter: (value) => value.toLocaleString()
              }
            });
          }
        }
      }
    }
    
    // Gráficos para lanzamientos
    if (queryType === 'releases') {
      // Verificar si hay datos de lanzamientos disponibles
      if (artistData.releases && artistData.releases.length > 0) {
        // Gráfico de streams por lanzamiento
        const releaseStreamsData = artistData.releases
          .filter(release => release.totalStreams)
          .map(release => ({
            name: release.title,
            date: release.releaseDate.toISOString().split('T')[0],
            streams: release.totalStreams
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        if (releaseStreamsData.length > 0) {
          configs.push({
            title: 'Reproducciones por lanzamiento',
            type: 'bar',
            data: releaseStreamsData,
            dataKey: 'streams',
            xAxisKey: 'name',
            color: '#1DB954', // Color de Spotify
            customTooltip: {
              formatter: (value) => value.toLocaleString()
            }
          });
        }
      }
    }
    
    // Si no hay configuraciones específicas, mostrar un resumen general
    if (configs.length === 0 && artistData.streamingStats?.overall) {
      // Crear datos para gráfico de resumen
      const summaryData = [
        { name: 'Reproducciones', value: artistData.streamingStats.overall.totalStreams },
        { name: 'Seguidores', value: artistData.profile.totalFollowers || 0 },
        { name: 'Eventos', value: (artistData.events?.past?.length || 0) + (artistData.events?.upcoming?.length || 0) },
        { name: 'Lanzamientos', value: artistData.releases?.length || 0 }
      ];
      
      configs.push({
        title: 'Resumen general',
        type: 'bar',
        data: summaryData,
        dataKey: 'value',
        xAxisKey: 'name',
        color: '#8884d8',
        customTooltip: {
          formatter: (value) => value.toLocaleString()
        }
      });
    }
    
    return configs;
  }, [artistData, queryType, entities, intent]);

  // Si no hay configuraciones, no renderizar nada
  if (chartConfigs.length === 0) {
    return null;
  }

  return (
    <div className="zeus-charts-container">
      {chartConfigs.map((config, index) => (
        <MetricsChart
          key={`chart-${index}`}
          data={config.data}
          type={config.type}
          dataKey={config.dataKey}
          compareKeys={config.compareKeys}
          xAxisKey={config.xAxisKey}
          title={config.title}
          color={config.color}
          customTooltip={config.customTooltip}
          height={300}
        />
      ))}
    </div>
  );
};

export default ChartGenerator;
