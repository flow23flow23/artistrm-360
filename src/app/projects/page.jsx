import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';

// Componentes
import ProjectCard from '@/components/projects/ProjectCard';
import ProjectFilter from '@/components/projects/ProjectFilter';
import CreateProjectButton from '@/components/projects/CreateProjectButton';

const Projects = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Cargar proyectos
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;
      
      try {
        // Simulación de carga de datos
        // En implementación real, estos serían llamados a Firestore
        const mockProjects = [
          { 
            id: 1, 
            title: 'Álbum 2023', 
            description: 'Nuevo álbum de estudio con 12 canciones',
            type: 'album',
            status: 'in-progress',
            progress: 75,
            dueDate: new Date(Date.now() + 30 * 86400000),
            collaborators: [
              { id: 1, name: 'Juan Pérez', role: 'Productor', avatar: '/avatars/juan.jpg' },
              { id: 2, name: 'María López', role: 'Ingeniera de sonido', avatar: '/avatars/maria.jpg' }
            ],
            tasks: [
              { id: 1, title: 'Grabación de voces', completed: true },
              { id: 2, title: 'Mezcla final', completed: false },
              { id: 3, title: 'Masterización', completed: false }
            ],
            cover: '/projects/album-cover.jpg',
            createdAt: new Date(Date.now() - 60 * 86400000)
          },
          { 
            id: 2, 
            title: 'Videoclip "Amanecer"', 
            description: 'Videoclip para el primer single del álbum',
            type: 'video',
            status: 'in-progress',
            progress: 90,
            dueDate: new Date(Date.now() + 10 * 86400000),
            collaborators: [
              { id: 3, name: 'Carlos Ruiz', role: 'Director', avatar: '/avatars/carlos.jpg' },
              { id: 4, name: 'Ana Gómez', role: 'Coreógrafa', avatar: '/avatars/ana.jpg' }
            ],
            tasks: [
              { id: 4, title: 'Rodaje', completed: true },
              { id: 5, title: 'Edición', completed: true },
              { id: 6, title: 'Efectos especiales', completed: false }
            ],
            cover: '/projects/video-cover.jpg',
            createdAt: new Date(Date.now() - 45 * 86400000)
          },
          { 
            id: 3, 
            title: 'Gira Nacional', 
            description: 'Gira de 15 conciertos por España',
            type: 'tour',
            status: 'in-progress',
            progress: 40,
            dueDate: new Date(Date.now() + 60 * 86400000),
            collaborators: [
              { id: 5, name: 'Laura Martínez', role: 'Manager', avatar: '/avatars/laura.jpg' },
              { id: 6, name: 'Roberto Sánchez', role: 'Técnico de sonido', avatar: '/avatars/roberto.jpg' }
            ],
            tasks: [
              { id: 7, title: 'Reserva de salas', completed: true },
              { id: 8, title: 'Venta de entradas', completed: false },
              { id: 9, title: 'Logística', completed: false }
            ],
            cover: '/projects/tour-cover.jpg',
            createdAt: new Date(Date.now() - 30 * 86400000)
          },
          { 
            id: 4, 
            title: 'Colaboración con DJ Max', 
            description: 'Single colaborativo para lanzamiento en verano',
            type: 'single',
            status: 'completed',
            progress: 100,
            dueDate: new Date(Date.now() - 15 * 86400000),
            collaborators: [
              { id: 7, name: 'DJ Max', role: 'Artista colaborador', avatar: '/avatars/max.jpg' },
              { id: 8, name: 'Elena Torres', role: 'Publicista', avatar: '/avatars/elena.jpg' }
            ],
            tasks: [
              { id: 10, title: 'Grabación', completed: true },
              { id: 11, title: 'Mezcla', completed: true },
              { id: 12, title: 'Lanzamiento', completed: true }
            ],
            cover: '/projects/collab-cover.jpg',
            createdAt: new Date(Date.now() - 90 * 86400000)
          },
          { 
            id: 5, 
            title: 'Merchandising 2023', 
            description: 'Nueva línea de merchandising para la gira',
            type: 'merch',
            status: 'planned',
            progress: 10,
            dueDate: new Date(Date.now() + 45 * 86400000),
            collaborators: [
              { id: 9, name: 'Pablo Díaz', role: 'Diseñador gráfico', avatar: '/avatars/pablo.jpg' }
            ],
            tasks: [
              { id: 13, title: 'Diseños', completed: true },
              { id: 14, title: 'Producción', completed: false },
              { id: 15, title: 'Distribución', completed: false }
            ],
            cover: '/projects/merch-cover.jpg',
            createdAt: new Date(Date.now() - 20 * 86400000)
          }
        ];
        
        setProjects(mockProjects);
        setFilteredProjects(mockProjects);
      } catch (error) {
        console.error('Error al cargar proyectos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  // Filtrar proyectos
  useEffect(() => {
    let result = [...projects];
    
    // Filtrar por estado
    if (filter !== 'all') {
      result = result.filter(project => project.status === filter);
    }
    
    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(project => 
        project.title.toLowerCase().includes(query) || 
        project.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredProjects(result);
  }, [filter, searchQuery, projects]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
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
          <h1 className="text-2xl font-bold mb-2">Proyectos</h1>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Gestiona tus proyectos musicales, videos, giras y más.
          </p>
        </div>
        <CreateProjectButton />
      </div>

      {/* Filtros y búsqueda */}
      <div className="mb-8">
        <ProjectFilter 
          activeFilter={filter} 
          onFilterChange={handleFilterChange} 
          onSearch={handleSearch}
        />
      </div>

      {/* Lista de proyectos */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className={`
          text-center py-12 rounded-lg
          ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}
        `}>
          <span className="material-icons text-5xl text-gray-500 mb-4">folder_off</span>
          <h3 className="text-xl font-medium mb-2">No se encontraron proyectos</h3>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {searchQuery 
              ? 'No hay proyectos que coincidan con tu búsqueda.' 
              : 'No hay proyectos con el filtro seleccionado.'}
          </p>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-4 text-purple-500 hover:text-purple-400"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Projects;
