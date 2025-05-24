// Archivo: /home/ubuntu/artistrm-360-github/src/components/zeus/charts/MetricsChart.jsx

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Componente para visualizar métricas del artista
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.data - Datos para la visualización
 * @param {string} props.type - Tipo de gráfico ('line', 'area', 'bar')
 * @param {string} props.dataKey - Clave principal de datos a visualizar
 * @param {Array} props.compareKeys - Claves adicionales para comparación
 * @param {string} props.xAxisKey - Clave para el eje X (generalmente fecha)
 * @param {string} props.title - Título del gráfico
 * @param {string} props.color - Color principal del gráfico
 * @param {boolean} props.showLegend - Mostrar leyenda
 * @param {Object} props.customTooltip - Configuración personalizada del tooltip
 * @param {number} props.height - Altura del gráfico
 */
const MetricsChart = ({
  data = [],
  type = 'line',
  dataKey,
  compareKeys = [],
  xAxisKey = 'date',
  title,
  color = '#8884d8',
  showLegend = true,
  customTooltip,
  height = 300
}) => {
  // Colores para múltiples series
  const colors = useMemo(() => [
    '#8884d8', // Morado
    '#82ca9d', // Verde
    '#ffc658', // Amarillo
    '#ff8042', // Naranja
    '#0088fe', // Azul
    '#ff6b6b', // Rojo
    '#6b88ff'  // Azul claro
  ], []);

  // Formatear datos si es necesario
  const formattedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map(item => {
      const newItem = { ...item };
      
      // Formatear fechas si es necesario
      if (newItem[xAxisKey] && typeof newItem[xAxisKey] === 'string') {
        try {
          // Intentar parsear como ISO date
          parseISO(newItem[xAxisKey]);
        } catch (e) {
          // Si no es una fecha ISO válida, dejar como está
        }
      }
      
      return newItem;
    });
  }, [data, xAxisKey]);

  // Formatear etiquetas del eje X
  const formatXAxis = (value) => {
    if (!value) return '';
    
    try {
      // Si es una fecha ISO
      if (typeof value === 'string' && value.includes('-')) {
        return format(parseISO(value), 'd MMM', { locale: es });
      }
      
      // Si es un timestamp
      if (typeof value === 'number' && value > 1000000000) {
        return format(new Date(value), 'd MMM', { locale: es });
      }
    } catch (e) {
      // Si hay error en el formato, devolver el valor original
    }
    
    return value;
  };

  // Componente de tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) {
      return null;
    }
    
    let formattedLabel = label;
    try {
      if (typeof label === 'string' && label.includes('-')) {
        formattedLabel = format(parseISO(label), 'd MMMM yyyy', { locale: es });
      }
    } catch (e) {
      // Si hay error en el formato, usar el label original
    }
    
    return (
      <div className="bg-gray-800 p-3 rounded-md shadow-lg border border-gray-700">
        <p className="text-gray-300 font-medium mb-2">{formattedLabel}</p>
        {payload.map((entry, index) => (
          <div key={`tooltip-${index}`} className="flex items-center mb-1">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-300 mr-2">
              {entry.name}:
            </span>
            <span className="text-white font-medium">
              {customTooltip && customTooltip.formatter 
                ? customTooltip.formatter(entry.value, entry.name) 
                : entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Renderizar el gráfico según el tipo
  const renderChart = () => {
    const allKeys = [dataKey, ...compareKeys];
    
    switch (type) {
      case 'line':
        return (
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis 
              dataKey={xAxisKey} 
              tickFormatter={formatXAxis} 
              tick={{ fill: '#aaa' }}
              stroke="#555"
            />
            <YAxis 
              tick={{ fill: '#aaa' }}
              stroke="#555"
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend wrapperStyle={{ color: '#ddd' }} />}
            
            {allKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={key}
                stroke={index === 0 ? color : colors[index % colors.length]}
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        );
        
      case 'area':
        return (
          <AreaChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis 
              dataKey={xAxisKey} 
              tickFormatter={formatXAxis} 
              tick={{ fill: '#aaa' }}
              stroke="#555"
            />
            <YAxis 
              tick={{ fill: '#aaa' }}
              stroke="#555"
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend wrapperStyle={{ color: '#ddd' }} />}
            
            {allKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                name={key}
                stroke={index === 0 ? color : colors[index % colors.length]}
                fill={index === 0 ? color : colors[index % colors.length]}
                fillOpacity={0.3}
              />
            ))}
          </AreaChart>
        );
        
      case 'bar':
        return (
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis 
              dataKey={xAxisKey} 
              tickFormatter={formatXAxis} 
              tick={{ fill: '#aaa' }}
              stroke="#555"
            />
            <YAxis 
              tick={{ fill: '#aaa' }}
              stroke="#555"
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend wrapperStyle={{ color: '#ddd' }} />}
            
            {allKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                name={key}
                fill={index === 0 ? color : colors[index % colors.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );
        
      default:
        return (
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis 
              dataKey={xAxisKey} 
              tickFormatter={formatXAxis} 
              tick={{ fill: '#aaa' }}
              stroke="#555"
            />
            <YAxis 
              tick={{ fill: '#aaa' }}
              stroke="#555"
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend wrapperStyle={{ color: '#ddd' }} />}
            
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
          </LineChart>
        );
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 shadow-lg border border-gray-800 mb-6">
      {title && (
        <h3 className="text-lg font-medium text-white mb-4">{title}</h3>
      )}
      <div className="w-full" style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MetricsChart;
