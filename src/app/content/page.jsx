import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';

// Componentes
import MediaGrid from '@/components/content/MediaGrid';
import ContentFilter from '@/components/content/ContentFilter';
import UploadButton from '@/components/content/UploadButton';
import ContentCalendar from '@/components/content/ContentCalendar';
import DistributionChannels from '@/components/content/DistributionChannels';

const Content = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mediaItems, setMediaItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'calendar', 'channels'

  // Cargar contenido multimedia
  useEffect(() => {
    const fetchContent = async () => {
      if (!user) return;
      
      try {
        // Simulación de carga de datos
        // En implementación real, estos serían llamados a Firestore y Storage
        const mockMediaItems = [
          { 
            id: 1, 
            title: 'Amanecer - Audio Master', 
            type: 'audio',
            format: 'mp3',
            duration: '3:45',
            size: '8.2 MB',
            url: '/media/amanecer.mp3',
            thumbnail: '/thumbnails/audio-amanecer.jpg',
            tags: ['single', 'master', '2023'],
            uploadDate: new Date(Date.now() - 5 * 86400000),
            project: 'Álbum 2023',
            distributed: true,
            platforms: ['Spotify', 'Apple Music', 'YouTube Music']
          },
          { 
            id: 2, 
            title: 'Videoclip Amanecer - Final Cut', 
            type: 'video',
            format: 'mp4',
            duration: '4:12',
            size: '156 MB',
            url: '/media/amanecer-video.mp4',
            thumbnail: '/thumbnails/video-amanecer.jpg',
            tags: ['videoclip', 'final', '2023'],
            uploadDate: new Date(Date.now() - 3 * 86400000),
            project: 'Videoclip "Amanecer"',
            distributed: true,
            platforms: ['YouTube', 'Instagram', 'TikTok']
          },
          { 
            id: 3, 
            title: 'Sesión fotográfica - Promo 2023', 
            type: 'image',
            format: 'jpg',
            size: '3.5 MB',
            url: '/media/promo-2023.jpg',
            thumbnail: '/thumbnails/image-promo.jpg',
            tags: ['promo', 'photo', '2023'],
            uploadDate: new Date(Date.now() - 10 * 86400000),
            project: 'Álbum 2023',
            distributed: true,
            platforms: ['Instagram', 'Facebook', 'Twitter']
          },
          { 
            id: 4, 
            title: 'Contrato - Colaboración DJ Max', 
            type: 'document',
            format: 'pdf',
            size: '1.2 MB',
            url: '/media/contrato-djmax.pdf',
            thumbnail: '/thumbnails/doc-contract.jpg',
            tags: ['legal', 'contract', 'collaboration'],
            uploadDate: new Date(Date.now() - 45 * 86400000),
            project: 'Colaboración con DJ Max',
            distributed: false,
            platforms: []
          },
          { 
            id: 5, 
            title: 'Noche - Demo', 
            type: 'audio',
            format: 'wav',
            duration: '3:22',
            size: '32.1 MB',
            url: '/media/noche-demo.wav',
            thumbnail: '/thumbnails/audio-noche.jpg',
            tags: ['demo', 'unreleased', '2023'],
            uploadDate: new Date(Date.now() - 15 * 86400000),
            project: 'Álbum 2023',
            distributed: false,
            platforms: []
          },
          { 
            id: 6, 
            title: 'Diseño Merchandising - Camiseta', 
            type: 'image',
            format: 'png',
            size: '2.8 MB',
            url: '/media/merch-tshirt.png',
            thumbnail: '/thumbnails/image-merch.jpg',
            tags: ['merch', 'design', '2023'],
            uploadDate: new Date(Date.now() - 8 * 86400000),
            project: 'Merchandising 2023',
            distributed: false,
            platforms: []
          },
          { 
            id: 7, 
            title: 'Rider Técnico - Gira 2023', 
            type: 'document',
            format: 'pdf',
            size: '0.9 MB',
            url: '/media/rider-tecnico.pdf',
            thumbnail: '/thumbnails/doc-rider.jpg',
            tags: ['tour', 'technical', '2023'],
            uploadDate: new Date(Date.now() - 20 * 86400000),
            project: 'Gira Nacional',
            distributed: false,
            platforms: []
          },
          { 
            id: 8, 
            title: 'Ensayo - Directo Madrid', 
            type: 'video',
            format: 'mp4',
            duration: '12:35',
            size: '345 MB',
            url: '/media/ensayo-madrid.mp4',
            thumbnail: '/thumbnails/video-rehearsal.jpg',
            tags: ['rehearsal', 'live', 'tour'],
            uploadDate: new Date(Date.now() - 2 * 86400000),
            project: 'Gira Nacional',
            distributed: false,
            platforms: []
          }
        ];
        
        setMediaItems(mockMediaItems);
        setFilteredItems(mockMediaItems);
      } catch (error) {
        console.error('Error al cargar contenido multimedia:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [user]);

  // Filtrar contenido
  useEffect(() => {
    let result = [...mediaItems];
    
    // Filtrar por tipo
    if (filter !== 'all') {
      result = result.filter(item => item.type === filter);
    }
    
    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.tags.some(tag => tag.toLowerCase().includes(query)) ||
        (item.project && item.project.toLowerCase().includes(query))
      );
    }
    
    setFilteredItems(result);
  }, [filter, searchQuery, mediaItems]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
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
          <h1 className="text-2xl font-bold mb-2">Biblioteca de Contenido</h1>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Gestiona tu contenido multimedia, organiza y distribuye tus archivos.
          </p>
        </div>
        <UploadButton />
      </div>

      {/* Filtros, búsqueda y selector de vista */}
      <div className="mb-8">
        <ContentFilter 
          activeFilter={filter} 
          onFilterChange={handleFilterChange} 
          onSearch={handleSearch}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />
      </div>

      {/* Contenido según modo de vista */}
      {viewMode === 'grid' && (
        filteredItems.length > 0 ? (
          <MediaGrid items={filteredItems} />
        ) : (
          <div className={`
            text-center py-12 rounded-lg
            ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}
          `}>
            <span className="material-icons text-5xl text-gray-500 mb-4">perm_media</span>
            <h3 className="text-xl font-medium mb-2">No se encontró contenido</h3>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {searchQuery 
                ? 'No hay archivos que coincidan con tu búsqueda.' 
                : 'No hay archivos con el filtro seleccionado.'}
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
        )
      )}

      {viewMode === 'calendar' && (
        <ContentCalendar items={mediaItems} />
      )}

      {viewMode === 'channels' && (
        <DistributionChannels items={mediaItems} />
      )}
    </div>
  );
};

export default Content;
