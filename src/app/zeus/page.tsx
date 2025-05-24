import { useContext, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/use-auth';
import { ZeusAssistant } from '@/components/zeus/ZeusAssistant';

export default function ZeusPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para procesar la consulta
    console.log('Procesando consulta:', query);
  };

  return (
    <Layout>
      <div className="zeus-container">
        <h1>Zeus IA - Tu asistente inteligente</h1>
        <p>Consulta cualquier información sobre tu carrera musical y obtén respuestas inteligentes</p>
        
        <ZeusAssistant query={query} onQueryChange={handleQueryChange} onSubmit={handleSubmit} />
        
        {/* Historial de consultas y sugerencias */}
        <div className="query-history">
          <h3>Consultas recientes</h3>
          <ul>
            <li>¿Cuáles son mis próximos eventos?</li>
            <li>Muestra el rendimiento de mi último lanzamiento</li>
            <li>Genera un reporte de ingresos del último trimestre</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
