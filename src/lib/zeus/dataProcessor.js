// Archivo: /home/ubuntu/artistrm-360-github/src/lib/zeus/dataProcessor.js

/**
 * Módulo de procesamiento de datos para Zeus IA
 * 
 * Este módulo proporciona funciones para procesar y transformar
 * los datos del artista en insights y contexto para las respuestas
 * de Zeus IA.
 */

import { format, differenceInDays, isAfter, isBefore, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Procesa los datos de eventos para extraer insights relevantes
 * @param {Object} events - Datos de eventos del artista
 * @returns {Object} - Insights sobre eventos
 */
export const processEventsData = (events) => {
  const { past, upcoming } = events;
  const now = new Date();
  
  // Calcular estadísticas de eventos pasados
  const pastStats = {
    total: past.length,
    venues: [...new Set(past.map(event => event.venue))].length,
    cities: [...new Set(past.map(event => event.city))].length,
    countries: [...new Set(past.map(event => event.country))].length,
    averageAttendance: past.reduce((sum, event) => sum + (event.attendance || 0), 0) / (past.length || 1),
  };
  
  // Identificar eventos destacados
  const highlightedPastEvents = past
    .filter(event => event.attendance > pastStats.averageAttendance * 1.2 || event.featured)
    .sort((a, b) => b.attendance - a.attendance)
    .slice(0, 3);
  
  // Analizar eventos próximos
  const nextEvent = upcoming.length > 0 ? upcoming[0] : null;
  const nextEventCountdown = nextEvent ? differenceInDays(nextEvent.date, now) : null;
  
  // Agrupar eventos próximos por mes
  const upcomingByMonth = {};
  upcoming.forEach(event => {
    const monthYear = format(event.date, 'MMMM yyyy', { locale: es });
    if (!upcomingByMonth[monthYear]) {
      upcomingByMonth[monthYear] = [];
    }
    upcomingByMonth[monthYear].push(event);
  });
  
  // Identificar períodos sin eventos (gaps)
  const eventGaps = [];
  if (upcoming.length >= 2) {
    for (let i = 0; i < upcoming.length - 1; i++) {
      const currentEvent = upcoming[i];
      const nextEvent = upcoming[i + 1];
      const daysBetween = differenceInDays(nextEvent.date, currentEvent.date);
      
      if (daysBetween > 30) {
        eventGaps.push({
          startDate: currentEvent.date,
          endDate: nextEvent.date,
          days: daysBetween,
          startEvent: currentEvent.name,
          endEvent: nextEvent.name
        });
      }
    }
  }
  
  return {
    pastStats,
    highlightedPastEvents,
    nextEvent,
    nextEventCountdown,
    upcomingByMonth,
    upcomingTotal: upcoming.length,
    eventGaps,
    insights: {
      hasBusySchedule: upcoming.length > 5,
      hasGaps: eventGaps.length > 0,
      needsMoreEvents: upcoming.length < 3,
      recentlyActive: past.length > 3,
      internationalPresence: pastStats.countries > 1 || [...new Set(upcoming.map(event => event.country))].length > 1
    }
  };
};

/**
 * Procesa los datos de lanzamientos para extraer insights relevantes
 * @param {Array} releases - Datos de lanzamientos del artista
 * @returns {Object} - Insights sobre lanzamientos
 */
export const processReleasesData = (releases) => {
  const now = new Date();
  
  // Separar lanzamientos recientes y antiguos
  const recentReleases = releases.filter(release => {
    return differenceInDays(now, release.releaseDate) <= 90;
  });
  
  const olderReleases = releases.filter(release => {
    return differenceInDays(now, release.releaseDate) > 90;
  });
  
  // Calcular estadísticas de lanzamientos
  const totalStreams = releases.reduce((sum, release) => sum + (release.totalStreams || 0), 0);
  const averageStreamsPerRelease = totalStreams / (releases.length || 1);
  
  // Identificar lanzamientos destacados
  const topReleases = [...releases]
    .sort((a, b) => (b.totalStreams || 0) - (a.totalStreams || 0))
    .slice(0, 3);
  
  // Analizar frecuencia de lanzamientos
  const releaseDates = releases.map(release => release.releaseDate).sort((a, b) => a - b);
  const releaseIntervals = [];
  
  if (releaseDates.length >= 2) {
    for (let i = 1; i < releaseDates.length; i++) {
      releaseIntervals.push(differenceInDays(releaseDates[i], releaseDates[i-1]));
    }
  }
  
  const averageReleaseInterval = releaseIntervals.length > 0 
    ? releaseIntervals.reduce((sum, interval) => sum + interval, 0) / releaseIntervals.length 
    : null;
  
  // Predecir próximo lanzamiento basado en patrones
  let predictedNextRelease = null;
  if (releaseDates.length > 0 && averageReleaseInterval) {
    const lastReleaseDate = releaseDates[releaseDates.length - 1];
    predictedNextRelease = addDays(lastReleaseDate, averageReleaseInterval);
  }
  
  return {
    recentReleases,
    olderReleases,
    totalReleases: releases.length,
    totalStreams,
    averageStreamsPerRelease,
    topReleases,
    averageReleaseInterval,
    predictedNextRelease,
    insights: {
      hasRecentRelease: recentReleases.length > 0,
      consistentReleaseSchedule: releaseIntervals.length >= 2 && 
        Math.max(...releaseIntervals) / Math.min(...releaseIntervals) < 2,
      needsNewRelease: !recentReleases.length && releases.length > 0,
      hasHitRelease: releases.some(release => (release.totalStreams || 0) > averageStreamsPerRelease * 2)
    }
  };
};

/**
 * Procesa los datos de métricas sociales para extraer insights relevantes
 * @param {Object} socialMetrics - Datos de métricas sociales del artista
 * @returns {Object} - Insights sobre métricas sociales
 */
export const processSocialMetricsData = (socialMetrics) => {
  const { raw, trends } = socialMetrics;
  
  // Calcular crecimiento porcentual
  const growthPercentages = {};
  
  Object.keys(trends).forEach(platform => {
    const platformTrends = trends[platform];
    
    growthPercentages[platform] = {
      followers: platformTrends.followers.start > 0 
        ? (platformTrends.followers.change / platformTrends.followers.start) * 100 
        : 0,
      engagement: platformTrends.engagement.start > 0 
        ? (platformTrends.engagement.change / platformTrends.engagement.start) * 100 
        : 0
    };
  });
  
  // Identificar plataforma con mejor desempeño
  let bestPlatform = null;
  let bestGrowth = -Infinity;
  
  Object.keys(growthPercentages).forEach(platform => {
    const followerGrowth = growthPercentages[platform].followers;
    if (followerGrowth > bestGrowth) {
      bestGrowth = followerGrowth;
      bestPlatform = platform;
    }
  });
  
  // Identificar plataforma con peor desempeño
  let worstPlatform = null;
  let worstGrowth = Infinity;
  
  Object.keys(growthPercentages).forEach(platform => {
    const followerGrowth = growthPercentages[platform].followers;
    if (followerGrowth < worstGrowth) {
      worstGrowth = followerGrowth;
      worstPlatform = platform;
    }
  });
  
  // Calcular engagement rate promedio por plataforma
  const engagementRates = {};
  
  Object.keys(raw).forEach(platform => {
    const platformData = raw[platform];
    if (platformData.length > 0) {
      const latestData = platformData[platformData.length - 1];
      engagementRates[platform] = latestData.followers > 0 
        ? (latestData.engagement / latestData.followers) * 100 
        : 0;
    }
  });
  
  return {
    trends,
    growthPercentages,
    bestPlatform,
    bestGrowth,
    worstPlatform,
    worstGrowth,
    engagementRates,
    insights: {
      overallGrowthPositive: Object.values(growthPercentages).some(platform => platform.followers > 0),
      needsAttentionPlatform: worstGrowth < 0 ? worstPlatform : null,
      focusPlatform: bestGrowth > 5 ? bestPlatform : null,
      engagementIssue: Object.values(engagementRates).some(rate => rate < 1),
      balancedPresence: Object.keys(engagementRates).length >= 3
    }
  };
};

/**
 * Procesa los datos de streaming para extraer insights relevantes
 * @param {Object} streamingStats - Datos de streaming del artista
 * @returns {Object} - Insights sobre streaming
 */
export const processStreamingData = (streamingStats) => {
  const { raw, summary, overall } = streamingStats;
  
  // Calcular distribución de streams por plataforma
  const streamDistribution = {};
  
  Object.keys(summary).forEach(platform => {
    streamDistribution[platform] = overall.totalStreams > 0 
      ? (summary[platform].totalStreams / overall.totalStreams) * 100 
      : 0;
  });
  
  // Identificar plataforma dominante
  let dominantPlatform = null;
  let highestDistribution = 0;
  
  Object.keys(streamDistribution).forEach(platform => {
    if (streamDistribution[platform] > highestDistribution) {
      highestDistribution = streamDistribution[platform];
      dominantPlatform = platform;
    }
  });
  
  // Calcular tendencias de crecimiento por plataforma
  const growthTrends = {};
  
  Object.keys(raw).forEach(platform => {
    const platformData = raw[platform];
    if (platformData.length >= 2) {
      const firstHalf = platformData.slice(0, Math.floor(platformData.length / 2));
      const secondHalf = platformData.slice(Math.floor(platformData.length / 2));
      
      const firstHalfTotal = firstHalf.reduce((sum, item) => sum + (item.streams || 0), 0);
      const secondHalfTotal = secondHalf.reduce((sum, item) => sum + (item.streams || 0), 0);
      
      growthTrends[platform] = firstHalfTotal > 0 
        ? ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100 
        : 0;
    }
  });
  
  // Calcular ingresos promedio por stream
  const revenuePerStream = {};
  
  Object.keys(summary).forEach(platform => {
    revenuePerStream[platform] = summary[platform].totalStreams > 0 
      ? summary[platform].totalRevenue / summary[platform].totalStreams 
      : 0;
  });
  
  const overallRevenuePerStream = overall.totalStreams > 0 
    ? overall.totalRevenue / overall.totalStreams 
    : 0;
  
  return {
    summary,
    overall,
    streamDistribution,
    dominantPlatform,
    highestDistribution,
    growthTrends,
    revenuePerStream,
    overallRevenuePerStream,
    insights: {
      platformDiversity: Object.keys(streamDistribution).filter(platform => streamDistribution[platform] > 5).length,
      overDependence: highestDistribution > 70,
      growingPlatforms: Object.keys(growthTrends).filter(platform => growthTrends[platform] > 10),
      decliningPlatforms: Object.keys(growthTrends).filter(platform => growthTrends[platform] < -10),
      profitablePlatform: Object.keys(revenuePerStream).reduce((a, b) => 
        revenuePerStream[a] > revenuePerStream[b] ? a : b, Object.keys(revenuePerStream)[0])
    }
  };
};

/**
 * Genera un análisis completo de los datos del artista
 * @param {Object} artistData - Datos completos del artista
 * @returns {Object} - Análisis completo con insights
 */
export const generateArtistAnalysis = (artistData) => {
  const { profile, events, releases, socialMetrics, streamingStats } = artistData;
  
  // Procesar cada conjunto de datos
  const eventsAnalysis = processEventsData(events);
  const releasesAnalysis = processReleasesData(releases);
  const socialAnalysis = processSocialMetricsData(socialMetrics);
  const streamingAnalysis = processStreamingData(streamingStats);
  
  // Generar recomendaciones basadas en insights
  const recommendations = [];
  
  // Recomendaciones basadas en eventos
  if (eventsAnalysis.insights.needsMoreEvents) {
    recommendations.push({
      type: 'events',
      priority: 'alta',
      title: 'Programar más eventos',
      description: 'Tu calendario de eventos próximos tiene pocas fechas. Considera programar más presentaciones para mantener el impulso.'
    });
  }
  
  if (eventsAnalysis.insights.hasGaps && eventsAnalysis.eventGaps.length > 0) {
    const longestGap = eventsAnalysis.eventGaps.reduce((a, b) => a.days > b.days ? a : b);
    recommendations.push({
      type: 'events',
      priority: 'media',
      title: 'Llenar período sin eventos',
      description: `Tienes un período de ${longestGap.days} días sin eventos entre ${format(longestGap.startDate, 'd MMMM', { locale: es })} y ${format(longestGap.endDate, 'd MMMM', { locale: es })}. Considera programar algo en este intervalo.`
    });
  }
  
  // Recomendaciones basadas en lanzamientos
  if (releasesAnalysis.insights.needsNewRelease) {
    recommendations.push({
      type: 'releases',
      priority: 'alta',
      title: 'Planificar nuevo lanzamiento',
      description: 'Han pasado más de 90 días desde tu último lanzamiento. Considera programar un nuevo single o EP para mantener el engagement.'
    });
  }
  
  if (releasesAnalysis.predictedNextRelease && isAfter(releasesAnalysis.predictedNextRelease, new Date())) {
    recommendations.push({
      type: 'releases',
      priority: 'media',
      title: 'Preparar próximo lanzamiento',
      description: `Basado en tu historial, tu próximo lanzamiento debería ser alrededor del ${format(releasesAnalysis.predictedNextRelease, 'd MMMM yyyy', { locale: es })}. Comienza a planificar ahora.`
    });
  }
  
  // Recomendaciones basadas en redes sociales
  if (socialAnalysis.insights.needsAttentionPlatform) {
    recommendations.push({
      type: 'social',
      priority: 'alta',
      title: `Mejorar presencia en ${socialAnalysis.insights.needsAttentionPlatform}`,
      description: `Tu cuenta de ${socialAnalysis.insights.needsAttentionPlatform} está perdiendo seguidores. Considera aumentar la frecuencia y calidad de publicaciones.`
    });
  }
  
  if (socialAnalysis.insights.engagementIssue) {
    recommendations.push({
      type: 'social',
      priority: 'media',
      title: 'Aumentar engagement en redes sociales',
      description: 'Tu tasa de engagement es baja. Intenta crear contenido más interactivo y responder a los comentarios de tus seguidores.'
    });
  }
  
  // Recomendaciones basadas en streaming
  if (streamingAnalysis.insights.overDependence) {
    recommendations.push({
      type: 'streaming',
      priority: 'media',
      title: 'Diversificar presencia en plataformas',
      description: `El ${streamingAnalysis.highestDistribution.toFixed(1)}% de tus streams provienen de ${streamingAnalysis.dominantPlatform}. Considera promocionar tu música en otras plataformas para diversificar.`
    });
  }
  
  if (streamingAnalysis.insights.decliningPlatforms.length > 0) {
    recommendations.push({
      type: 'streaming',
      priority: 'alta',
      title: `Atención a plataformas en declive`,
      description: `Tus streams están disminuyendo en ${streamingAnalysis.insights.decliningPlatforms.join(', ')}. Analiza las posibles causas y considera estrategias específicas para estas plataformas.`
    });
  }
  
  // Generar resumen general
  const summary = {
    artistName: profile.artistName || profile.displayName,
    totalEvents: eventsAnalysis.pastStats.total + eventsAnalysis.upcomingTotal,
    totalReleases: releasesAnalysis.totalReleases,
    totalStreams: streamingAnalysis.overall.totalStreams,
    totalRevenue: streamingAnalysis.overall.totalRevenue,
    nextEvent: eventsAnalysis.nextEvent,
    latestRelease: releasesAnalysis.recentReleases[0] || null,
    topPlatforms: {
      social: socialAnalysis.bestPlatform,
      streaming: streamingAnalysis.dominantPlatform
    },
    recommendations: recommendations.sort((a, b) => {
      const priorityValues = { alta: 3, media: 2, baja: 1 };
      return priorityValues[b.priority] - priorityValues[a.priority];
    })
  };
  
  return {
    summary,
    detail: {
      events: eventsAnalysis,
      releases: releasesAnalysis,
      social: socialAnalysis,
      streaming: streamingAnalysis
    },
    timestamp: new Date()
  };
};
