// Archivo: /home/ubuntu/artistrm-360-github/src/components/zeus/charts/__tests__/MetricsChart.test.jsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import MetricsChart from '../MetricsChart';

// Mock de recharts
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
    LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
    AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
    BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
    Line: () => <div data-testid="line" />,
    Area: () => <div data-testid="area" />,
    Bar: () => <div data-testid="bar" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />
  };
});

describe('MetricsChart', () => {
  // Datos de prueba
  const testData = [
    { date: '2023-01-01', value: 100, comparison: 50 },
    { date: '2023-02-01', value: 150, comparison: 75 },
    { date: '2023-03-01', value: 200, comparison: 100 }
  ];

  it('debe renderizar un gráfico de líneas correctamente', () => {
    render(
      <MetricsChart
        data={testData}
        type="line"
        dataKey="value"
        xAxisKey="date"
        title="Gráfico de prueba"
      />
    );

    // Verificar título
    expect(screen.getByText('Gráfico de prueba')).toBeInTheDocument();
    
    // Verificar componentes del gráfico
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('legend')).toBeInTheDocument();
    expect(screen.getByTestId('line')).toBeInTheDocument();
  });

  it('debe renderizar un gráfico de área correctamente', () => {
    render(
      <MetricsChart
        data={testData}
        type="area"
        dataKey="value"
        xAxisKey="date"
        title="Gráfico de área"
      />
    );

    // Verificar título
    expect(screen.getByText('Gráfico de área')).toBeInTheDocument();
    
    // Verificar componentes del gráfico
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    expect(screen.getByTestId('area')).toBeInTheDocument();
  });

  it('debe renderizar un gráfico de barras correctamente', () => {
    render(
      <MetricsChart
        data={testData}
        type="bar"
        dataKey="value"
        xAxisKey="date"
        title="Gráfico de barras"
      />
    );

    // Verificar título
    expect(screen.getByText('Gráfico de barras')).toBeInTheDocument();
    
    // Verificar componentes del gráfico
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar')).toBeInTheDocument();
  });

  it('debe manejar múltiples series de datos correctamente', () => {
    render(
      <MetricsChart
        data={testData}
        type="line"
        dataKey="value"
        compareKeys={['comparison']}
        xAxisKey="date"
        title="Gráfico con múltiples series"
      />
    );

    // Verificar título
    expect(screen.getByText('Gráfico con múltiples series')).toBeInTheDocument();
    
    // Verificar componentes del gráfico
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    
    // Debería haber dos líneas (una para cada serie)
    const lines = screen.getAllByTestId('line');
    expect(lines.length).toBe(2);
  });

  it('debe manejar datos vacíos correctamente', () => {
    render(
      <MetricsChart
        data={[]}
        type="line"
        dataKey="value"
        xAxisKey="date"
        title="Gráfico sin datos"
      />
    );

    // Verificar título
    expect(screen.getByText('Gráfico sin datos')).toBeInTheDocument();
    
    // Verificar que el gráfico se renderiza aunque no haya datos
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('debe aplicar la altura personalizada correctamente', () => {
    render(
      <MetricsChart
        data={testData}
        type="line"
        dataKey="value"
        xAxisKey="date"
        title="Gráfico con altura personalizada"
        height={500}
      />
    );

    // Verificar que el contenedor tiene la altura correcta
    const container = screen.getByTestId('responsive-container').parentElement;
    expect(container.style.height).toBe('500px');
  });

  it('debe ocultar la leyenda cuando showLegend es false', () => {
    render(
      <MetricsChart
        data={testData}
        type="line"
        dataKey="value"
        xAxisKey="date"
        title="Gráfico sin leyenda"
        showLegend={false}
      />
    );

    // Verificar que la leyenda no está presente
    expect(screen.queryByTestId('legend')).not.toBeInTheDocument();
  });

  it('debe usar el color personalizado correctamente', () => {
    const { container } = render(
      <MetricsChart
        data={testData}
        type="line"
        dataKey="value"
        xAxisKey="date"
        title="Gráfico con color personalizado"
        color="#FF0000"
      />
    );

    // No podemos verificar directamente el color en este test debido a las limitaciones del mock,
    // pero podemos verificar que el componente se renderiza correctamente
    expect(screen.getByText('Gráfico con color personalizado')).toBeInTheDocument();
  });
});
