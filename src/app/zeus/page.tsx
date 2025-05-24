import React, { lazy, Suspense, useState, useCallback, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/use-auth';
import { CircularProgress, Box, Typography, Button } from '@mui/material';

// Cargar el componente ZeusAssistant con lazy loading
const ZeusAssistant = lazy(() => import('@/components/zeus/ZeusAssistant'));

// Cargar el historial de consultas con lazy loading
const QueryHistory = lazy(() => import('@/components/zeus/QueryHistory'));

// Componente optimizado para sugerencias de consultas
const QuerySuggestion = React.memo(({ suggestion, onSelect }) => (
  <li className="suggestion-item">
    <Button 
      variant="text" 
      onClick={() => onSelect(suggestion)}
      fullWidth
      sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
    >
      {suggestion}
    </Button>
  </li>
));

export default function ZeusPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  
  // Usar useCallback para evitar recreaciones de funciones
  const handleQueryChange = useCallback((e) => {
    setQuery(e.target.value);
  }, []);
  
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    // Lógica para procesar la consulta
    console.log('Procesando consulta:', query);
  }, [query]);
  
  const handleSuggestionSelect = useCallback((suggestion) => {
    setQuery(suggestion);
  }, []);

  // Memoizar las sugerencias para evitar recreaciones
  const suggestions = useMemo(() => [
    '¿Cuáles son mis próximos eventos?',
    'Muestra el rendimiento de mi último lanzamiento',
    'Genera un reporte de ingresos del último trimestre'
  ], []);

  return (
    <Layout>
      <div className="zeus-container">
        <h1>Zeus IA - Tu asistente inteligente</h1>
        <p>Consulta cualquier información sobre tu carrera musical y obtén respuestas inteligentes</p>
        
        <Suspense fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        }>
          <ZeusAssistant 
            query={query} 
            onQueryChange={handleQueryChange} 
            onSubmit={handleSubmit} 
          />
        </Suspense>
        
        {/* Historial de consultas y sugerencias */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" component="h3">Consultas sugeridas</Typography>
          <ul className="suggestion-list">
            {suggestions.map((suggestion, index) => (
              <QuerySuggestion 
                key={index}
                suggestion={suggestion}
                onSelect={handleSuggestionSelect}
              />
            ))}
          </ul>
        </Box>
        
        <Suspense fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        }>
          {user && <QueryHistory userId={user.uid} />}
        </Suspense>
      </div>
    </Layout>
  );
}
