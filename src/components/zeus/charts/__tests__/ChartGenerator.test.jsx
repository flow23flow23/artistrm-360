// Archivo: /home/ubuntu/artistrm-360-github/src/components/zeus/charts/__tests__/ChartGenerator.test.jsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import ChartGenerator from '../ChartGenerator';
import MetricsChart from '../MetricsChart';

// Mock de MetricsChart
jest.mock('../MetricsChart', () => {
  return jest.fn(props => (
    <div data-testid="metrics-chart">
      <div data-testid="chart-title">{props.title}</div>
      <div data-testid="chart-type">{props.type}</div>
      <div data-testid="chart-data-key">{props.dataKey}</div>
    </div>
  ));
});

describe('ChartGenerator', () => {
  // Datos de prueba
  const mockArtistData = {
    profile: {
      displayName: 'Test Artist',
      totalFollowers: 5000
    },
    streamingStats: {
      raw: {
        spotify: [
          { date: new Date('2023-01-01'), streams: 1000 },
          { date: new Date('2023-02-01'), streams: 1500 }
        ],
        appleMusic: [
          { date: new Date('2023-01-01'), streams: 500 },
          { date: new Date('2023-02-01'), streams: 700 }
        ]
      },
      streamDistribution: {
        spotify: 65,
        appleMusic: 35
      },
      overall: {
        totalStreams: 3700,
        totalRevenue: 185
      }
    },
    socialMetrics: {
      raw: {
        instagram: [
          { date: new Date('2023-01-01'), followers: 2000, engagement: 200 },
          { date: new Date('2023-02-01'), followers: 2200, engagement: 220 }
        ],
        tiktok: [
          { date: new Date('2023-01-01'), followers: 1000, engagement: 300 },
          { date: new Date('2023-02-01'), followers: 1200, engagement: 360 }
        ]
      },
      growthPercentages: {
        instagram: { followers: 10, engagement: 10 },
        tiktok: { followers: 20, engagement: 20 }
      }
    },
    events: {
      past: [
        { name: 'Past Event 1', date: new Date('2023-01-15'), attendance: 500 },
        { name: 'Past Event 2', date: new Date('2023-02-20'), attendance: 600 }
      ],
      upcoming: [
        { name: 'Future Event 1', date: new Date('2023-06-15') },
        { name: 'Future Event 2', date: new Date('2023-07-20') }
      ]
    },
    releases: [
      { title: 'Album 1', releaseDate: new Date('2023-01-01'), totalStreams: 10000 },
      { title: 'Single 1', releaseDate: new Date('2023-03-01'), totalStreams: 5000 }
    ]
  };

  beforeEach(() => {
    MetricsChart.mockClear();
  });

  it('debe generar gráficos para datos de streaming', () => {
    render(
      <ChartGenerator
        artistData={mockArtistData}
        queryType="streaming"
        entities={{ contentTypes: ['streams'] }}
        intent="get_stats"
      />
    );

    // Verificar que se generan los gráficos esperados
    expect(MetricsChart).toHaveBeenCalled();
    
    // Verificar título del primer gráfico
    const chartTitles = screen.getAllByTestId('chart-title');
    expect(chartTitles[0].textContent).toBe('Reproducciones por plataforma');
    
    // Verificar que hay un gráfico de distribución
    expect(chartTitles[1].textContent).toBe('Distribución de reproducciones');
  });

  it('debe generar gráficos para datos de redes sociales', () => {
    render(
      <ChartGenerator
        artistData={mockArtistData}
        queryType="social_media"
        entities={{ contentTypes: ['followers', 'engagement'] }}
        intent="get_performance"
      />
    );

    // Verificar que se generan los gráficos esperados
    expect(MetricsChart).toHaveBeenCalled();
    
    // Verificar títulos de gráficos
    const chartTitles = screen.getAllByTestId('chart-title');
    expect(chartTitles.some(title => title.textContent.includes('Seguidores en instagram'))).toBe(true);
    expect(chartTitles.some(title => title.textContent.includes('Engagement en instagram'))).toBe(true);
    expect(chartTitles.some(title => title.textContent.includes('Seguidores en tiktok'))).toBe(true);
    expect(chartTitles.some(title => title.textContent.includes('Engagement en tiktok'))).toBe(true);
    expect(chartTitles.some(title => title.textContent.includes('Crecimiento por plataforma'))).toBe(true);
  });

  it('debe generar gráficos para datos de eventos', () => {
    render(
      <ChartGenerator
        artistData={mockArtistData}
        queryType="events"
        entities={{}}
        intent="get_schedule"
      />
    );

    // Verificar que se generan los gráficos esperados
    expect(MetricsChart).toHaveBeenCalled();
    
    // Verificar títulos de gráficos
    const chartTitles = screen.getAllByTestId('chart-title');
    expect(chartTitles.some(title => title.textContent === 'Eventos por mes')).toBe(true);
    expect(chartTitles.some(title => title.textContent === 'Asistencia a eventos')).toBe(true);
  });

  it('debe generar gráficos para datos de lanzamientos', () => {
    render(
      <ChartGenerator
        artistData={mockArtistData}
        queryType="releases"
        entities={{}}
        intent="get_stats"
      />
    );

    // Verificar que se generan los gráficos esperados
    expect(MetricsChart).toHaveBeenCalled();
    
    // Verificar títulos de gráficos
    const chartTitles = screen.getAllByTestId('chart-title');
    expect(chartTitles.some(title => title.textContent === 'Reproducciones por lanzamiento')).toBe(true);
  });

  it('debe generar un resumen general cuando no hay datos específicos', () => {
    render(
      <ChartGenerator
        artistData={mockArtistData}
        queryType="general"
        entities={{}}
        intent="general_query"
      />
    );

    // Verificar que se genera el gráfico de resumen
    expect(MetricsChart).toHaveBeenCalled();
    
    // Verificar título del gráfico
    const chartTitles = screen.getAllByTestId('chart-title');
    expect(chartTitles[0].textContent).toBe('Resumen general');
  });

  it('no debe renderizar nada si no hay datos disponibles', () => {
    const { container } = render(
      <ChartGenerator
        artistData={null}
        queryType="streaming"
        entities={{}}
        intent="get_stats"
      />
    );

    // Verificar que no se renderiza nada
    expect(container.firstChild).toBeNull();
    expect(MetricsChart).not.toHaveBeenCalled();
  });

  it('debe manejar datos parciales correctamente', () => {
    const partialData = {
      profile: mockArtistData.profile,
      // Sin datos de streaming
      socialMetrics: mockArtistData.socialMetrics,
      // Sin datos de eventos
      // Sin datos de lanzamientos
    };

    render(
      <ChartGenerator
        artistData={partialData}
        queryType="social_media"
        entities={{ contentTypes: ['followers'] }}
        intent="get_stats"
      />
    );

    // Verificar que se generan los gráficos disponibles
    expect(MetricsChart).toHaveBeenCalled();
    
    // Verificar que hay gráficos de redes sociales
    const chartTitles = screen.getAllByTestId('chart-title');
    expect(chartTitles.some(title => title.textContent.includes('Seguidores en'))).toBe(true);
    
    // Verificar que no hay gráficos de streaming
    expect(chartTitles.some(title => title.textContent.includes('Reproducciones por plataforma'))).toBe(false);
  });
});
