import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../utils/firebase';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FaSpotify, FaYoutube, FaInstagram, FaTiktok, FaPlus, FaSearch, FaEllipsisH, FaPlay, FaLink, FaShare, FaDownload, FaTrash, FaEdit } from 'react-icons/fa';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: 'audio' | 'video' | 'image' | 'document';
  url: string;
  thumbnailUrl?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'published' | 'archived';
  platforms: string[];
  stats: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
  };
}

interface ContentFilter {
  type: string;
  status: string;
  platform: string;
  searchQuery: string;
}

const ContentPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filters, setFilters] = useState<ContentFilter>({
    type: 'all',
    status: 'all',
    platform: 'all',
    searchQuery: '',
  });
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    type: 'image',
    tags: '',
    status: 'draft',
    platforms: [] as string[],
  });
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        // En un caso real, estos datos vendrían de Firebase
        // Aquí simulamos datos para la demostración
        
        const mockContentItems: ContentItem[] = [
          {
            id: '1',
            title: 'Nuevo Single - Amanecer',
            description: 'Lanzamiento oficial del nuevo single "Amanecer" con visuales exclusivos.',
            type: 'audio',
            url: 'https://example.com/audio/amanecer.mp3',
            thumbnailUrl: 'https://example.com/images/amanecer_cover.jpg',
            tags: ['single', 'lanzamiento', 'electrónica'],
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 días atrás
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 días atrás
            status: 'published',
            platforms: ['spotify', 'youtube', 'instagram'],
            stats: {
              views: 12500,
              likes: 843,
              shares: 156,
              comments: 78
            }
          },
          {
            id: '2',
            title: 'Behind the Scenes - Sesión de Estudio',
            description: 'Material exclusivo de la sesión de grabación del próximo EP.',
            type: 'video',
            url: 'https://example.com/videos/studio_session.mp4',
            thumbnailUrl: 'https://example.com/images/studio_thumbnail.jpg',
            tags: ['behind the scenes', 'estudio', 'grabación'],
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 14 días atrás
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 14 días atrás
            status: 'published',
            platforms: ['youtube', 'instagram'],
            stats: {
              views: 8300,
              likes: 612,
              shares: 94,
              comments: 47
            }
          },
          {
            id: '3',
            title: 'Fotos Promocionales - Colección 2025',
            description: 'Nueva sesión fotográfica para material promocional y redes sociales.',
            type: 'image',
            url: 'https://example.com/images/promo_2025.jpg',
            tags: ['fotos', 'promoción', 'redes sociales'],
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 días atrás
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 días atrás
            status: 'published',
            platforms: ['instagram', 'tiktok'],
            stats: {
              views: 5600,
              likes: 720,
              shares: 85,
              comments: 32
            }
          },
          {
            id: '4',
            title: 'Letra - Amanecer',
            description: 'Documento con la letra oficial de "Amanecer" para compartir con fans.',
            type: 'document',
            url: 'https://example.com/docs/amanecer_lyrics.pdf',
            tags: ['letra', 'single', 'fans'],
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6), // 6 días atrás
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6), // 6 días atrás
            status: 'published',
            platforms: ['spotify'],
            stats: {
              views: 2300,
              likes: 145,
              shares: 67,
              comments: 12
            }
          },
          {
            id: '5',
            title: 'Teaser - Próximo Videoclip',
            description: 'Adelanto exclusivo del próximo videoclip a estrenarse el mes que viene.',
            type: 'video',
            url: 'https://example.com/videos/teaser_upcoming.mp4',
            thumbnailUrl: 'https://example.com/images/teaser_thumbnail.jpg',
            tags: ['teaser', 'videoclip', 'adelanto'],
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 días atrás
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 días atrás
            status: 'draft',
            platforms: [],
            stats: {
              views: 0,
              likes: 0,
              shares: 0,
              comments: 0
            }
          },
          {
            id: '6',
            title: 'Remix - Colaboración con DJ Pulse',
            description: 'Versión remix de "Amanecer" en colaboración con DJ Pulse.',
            type: 'audio',
            url: 'https://example.com/audio/amanecer_remix.mp3',
            thumbnailUrl: 'https://example.com/images/remix_cover.jpg',
            tags: ['remix', 'colaboración', 'electrónica'],
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 días atrás
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8), // 8 días atrás
            status: 'published',
            platforms: ['spotify', 'youtube'],
            stats: {
              views: 7800,
              likes: 520,
              shares: 110,
              comments: 43
            }
          }
        ];
        
        setContentItems(mockContentItems);
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContent();
  }, [user]);

  const handleFilterChange = (filterType: keyof ContentFilter, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      searchQuery: e.target.value
    }));
  };

  const filteredContent = contentItems.filter(item => {
    // Filtrar por tipo
    if (filters.type !== 'all' && item.type !== filters.type) return false;
    
    // Filtrar por estado
    if (filters.status !== 'all' && item.status !== filters.status) return false;
    
    // Filtrar por plataforma
    if (filters.platform !== 'all' && !item.platforms.includes(filters.platform)) return false;
    
    // Filtrar por búsqueda
    if (filters.searchQuery && !item.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) && 
        !item.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
        !item.tags.some(tag => tag.toLowerCase().includes(filters.searchQuery.toLowerCase()))) {
      return false;
    }
    
    return true;
  });

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUploadData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlatformToggle = (platform: string) => {
    setUploadData(prev => {
      const platforms = [...prev.platforms];
      const index = platforms.indexOf(platform);
      
      if (index === -1) {
        platforms.push(platform);
      } else {
        platforms.splice(index, 1);
      }
      
      return {
        ...prev,
        platforms
      };
    });
  };

  const handleUpload = async () => {
    if (!file) return;
    
    // Simular carga
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
    
    // En un caso real, aquí subiríamos el archivo a Firebase Storage
    // y guardaríamos los metadatos en Firestore
    
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      
      // Crear nuevo item de contenido
      const newItem: ContentItem = {
        id: (contentItems.length + 1).toString(),
        title: uploadData.title,
        description: uploadData.description,
        type: uploadData.type as 'audio' | 'video' | 'image' | 'document',
        url: URL.createObjectURL(file),
        thumbnailUrl: uploadData.type === 'audio' || uploadData.type === 'video' ? URL.createObjectURL(file) : undefined,
        tags: uploadData.tags.split(',').map(tag => tag.trim()),
        createdAt: new Date(),
        updatedAt: new Date(),
        status: uploadData.status as 'draft' | 'published' | 'archived',
        platforms: uploadData.platforms,
        stats: {
          views: 0,
          likes: 0,
          shares: 0,
          comments: 0
        }
      };
      
      setContentItems(prev => [newItem, ...prev]);
      setShowUploadModal(false);
      setFile(null);
      setUploadData({
        title: '',
        description: '',
        type: 'image',
        tags: '',
        status: 'draft',
        platforms: [],
      });
    }, 3000);
  };

  const handleItemClick = (item: ContentItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleDeleteItem = (id: string) => {
    // En un caso real, eliminaríamos el item de Firebase
    setContentItems(prev => prev.filter(item => item.id !== id));
    setShowDetailModal(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'audio':
        return <FaPlay className="text-blue-500" />;
      case 'video':
        return <FaPlay className="text-red-500" />;
      case 'image':
        return <FaImage className="text-green-500" />;
      case 'document':
        return <FaFileAlt className="text-yellow-500" />;
      default:
        return <FaFile className="text-gray-500" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'spotify':
        return <FaSpotify className="text-green-500" />;
      case 'youtube':
        return <FaYoutube className="text-red-500" />;
      case 'instagram':
        return <FaInstagram className="text-purple-500" />;
      case 'tiktok':
        return <FaTiktok className="text-black dark:text-white" />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Contenido Multimedia</h1>
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700 transition-all duration-300 flex items-center"
            onClick={() => setShowUploadModal(true)}
          >
            <FaPlus className="mr-2" />
            Subir Contenido
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
              <select
                className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="all">Todos los tipos</option>
                <option value="audio">Audio</option>
                <option value="video">Video</option>
                <option value="image">Imagen</option>
                <option value="document">Documento</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
              <select
                className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="published">Publicado</option>
                <option value="draft">Borrador</option>
                <option value="archived">Archivado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plataforma</label>
              <select
                className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={filters.platform}
                onChange={(e) => handleFilterChange('platform', e.target.value)}
              >
                <option value="all">Todas las plataformas</option>
                <option value="spotify">Spotify</option>
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buscar</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Buscar contenido..."
                  value={filters.searchQuery}
                  onChange={handleSearchChange}
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer"
                onClick={() => handleItemClick(item)}
              >
                <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                  {item.type === 'audio' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">
                      <FaPlay className="text-white text-4xl" />
                    </div>
                  )}
                  {item.type === 'video' && item.thumbnailUrl && (
                    <div className="relative w-full h-full">
                      <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                        <FaPlay className="text-white text-4xl" />
                      </div>
                    </div>
                  )}
                  {item.type === 'image' && (
                    <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                  )}
                  {item.type === 'document' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-yellow-400 to-orange-500">
                      <FaFileAlt className="text-white text-4xl" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1 line-clamp-1">{item.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(item.status)}`}>
                      {item.status === 'published' ? 'Publicado' : 
                       item.status === 'draft' ? 'Borrador' : 'Archivado'}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      {item.platforms.map((platform, index) => (
                        <span key={index} className="text-lg">
                          {getPlatformIcon(platform)}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal de Subida */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Subir Nuevo Contenido</h2>
                  <button
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={() => setShowUploadModal(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* Área de arrastrar y soltar */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center ${
                      dragActive
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20'
                        : 'border-gray-300 dark:border-gray-700'
                    }`}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                  >
                    {file ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center">
                          <FaCheckCircle className="text-green-500 text-2xl mr-2" />
                          <span className="text-gray-800 dark:text-white font-medium">{file.name}</span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          className="text-red-500 hover:text-red-700 text-sm"
                          onClick={() => setFile(null)}
                        >
                          Eliminar
                        </button>
                      </div>
                    ) : (
                      <>
                        <FaCloudUploadAlt className="mx-auto text-gray-400 text-5xl mb-4" />
                        <p className="text-gray-800 dark:text-white font-medium mb-2">
                          Arrastra y suelta archivos aquí
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                          o
                        </p>
                        <label className="bg-purple-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-purple-700 transition-colors duration-300">
                          Seleccionar Archivo
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </label>
                      </>
                    )}
                  </div>
                  
                  {/* Formulario de metadatos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
                      <input
                        type="text"
                        name="title"
                        className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={uploadData.title}
                        onChange={handleUploadChange}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                      <textarea
                        name="description"
                        rows={3}
                        className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        value={uploadData.description}
                        onChange={handleUploadChange}
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                      <select
                        name="type"
                        className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={uploadData.type}
                        onChange={handleUploadChange}
                      >
                        <option value="audio">Audio</option>
                        <option value="video">Video</option>
                        <option value="image">Imagen</option>
                        <option value="document">Documento</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                      <select
                        name="status"
                        className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={uploadData.status}
                        onChange={handleUploadChange}
                      >
                        <option value="draft">Borrador</option>
                        <option value="published">Publicado</option>
                        <option value="archived">Archivado</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Etiquetas (separadas por comas)</label>
                      <input
                        type="text"
                        name="tags"
                        className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="música, single, electrónica"
                        value={uploadData.tags}
                        onChange={handleUploadChange}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Plataformas</label>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          className={`flex items-center px-3 py-2 rounded-lg ${
                            uploadData.platforms.includes('spotify')
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                          onClick={() => handlePlatformToggle('spotify')}
                        >
                          <FaSpotify className="mr-2" />
                          Spotify
                        </button>
                        <button
                          type="button"
                          className={`flex items-center px-3 py-2 rounded-lg ${
                            uploadData.platforms.includes('youtube')
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                          onClick={() => handlePlatformToggle('youtube')}
                        >
                          <FaYoutube className="mr-2" />
                          YouTube
                        </button>
                        <button
                          type="button"
                          className={`flex items-center px-3 py-2 rounded-lg ${
                            uploadData.platforms.includes('instagram')
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                          onClick={() => handlePlatformToggle('instagram')}
                        >
                          <FaInstagram className="mr-2" />
                          Instagram
                        </button>
                        <button
                          type="button"
                          className={`flex items-center px-3 py-2 rounded-lg ${
                            uploadData.platforms.includes('tiktok')
                              ? 'bg-gray-800 text-white dark:bg-gray-900 dark:text-gray-100'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                          onClick={() => handlePlatformToggle('tiktok')}
                        >
                          <FaTiktok className="mr-2" />
                          TikTok
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-purple-600 h-2.5 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
                        {uploadProgress}% completado
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                      onClick={() => setShowUploadModal(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-300 disabled:opacity-50"
                      onClick={handleUpload}
                      disabled={!file || !uploadData.title || uploadProgress > 0 && uploadProgress < 100}
                    >
                      Subir Contenido
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Detalle */}
        {showDetailModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{selectedItem.title}</h2>
                  <button
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={() => setShowDetailModal(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden h-64 mb-4">
                      {selectedItem.type === 'audio' && (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">
                          <FaPlay className="text-white text-6xl" />
                        </div>
                      )}
                      {selectedItem.type === 'video' && selectedItem.thumbnailUrl && (
                        <div className="relative w-full h-full">
                          <img src={selectedItem.thumbnailUrl} alt={selectedItem.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                            <FaPlay className="text-white text-6xl" />
                          </div>
                        </div>
                      )}
                      {selectedItem.type === 'image' && (
                        <img src={selectedItem.url} alt={selectedItem.title} className="w-full h-full object-contain" />
                      )}
                      {selectedItem.type === 'document' && (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-yellow-400 to-orange-500">
                          <FaFileAlt className="text-white text-6xl" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 mb-4">
                      <button className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-lg flex items-center justify-center hover:bg-purple-700 transition-colors duration-300">
                        <FaPlay className="mr-2" />
                        Reproducir
                      </button>
                      <button className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-3 py-2 rounded-lg flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300">
                        <FaDownload className="mr-2" />
                        Descargar
                      </button>
                    </div>
                    
                    <div className="bg-gray-100 dark:bg-gray-750 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Estadísticas</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-700 p-3 rounded-lg text-center">
                          <p className="text-2xl font-bold text-purple-600">{selectedItem.stats.views.toLocaleString()}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Visualizaciones</p>
                        </div>
                        <div className="bg-white dark:bg-gray-700 p-3 rounded-lg text-center">
                          <p className="text-2xl font-bold text-red-500">{selectedItem.stats.likes.toLocaleString()}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Me gusta</p>
                        </div>
                        <div className="bg-white dark:bg-gray-700 p-3 rounded-lg text-center">
                          <p className="text-2xl font-bold text-blue-500">{selectedItem.stats.shares.toLocaleString()}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Compartidos</p>
                        </div>
                        <div className="bg-white dark:bg-gray-700 p-3 rounded-lg text-center">
                          <p className="text-2xl font-bold text-green-500">{selectedItem.stats.comments.toLocaleString()}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Comentarios</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="mb-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(selectedItem.status)} mb-2`}>
                        {selectedItem.status === 'published' ? 'Publicado' : 
                         selectedItem.status === 'draft' ? 'Borrador' : 'Archivado'}
                      </span>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{selectedItem.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {selectedItem.tags.map((tag, index) => (
                          <span key={index} className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded-full text-sm">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Tipo</p>
                          <p className="text-gray-800 dark:text-white font-medium">
                            {selectedItem.type.charAt(0).toUpperCase() + selectedItem.type.slice(1)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de creación</p>
                          <p className="text-gray-800 dark:text-white font-medium">
                            {formatDate(selectedItem.createdAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Última actualización</p>
                          <p className="text-gray-800 dark:text-white font-medium">
                            {formatDate(selectedItem.updatedAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">URL</p>
                          <div className="flex items-center">
                            <a
                              href={selectedItem.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 truncate mr-2"
                            >
                              {selectedItem.url.substring(0, 25)}...
                            </a>
                            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                              <FaLink />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {selectedItem.platforms.length > 0 && (
                        <div className="mb-6">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Plataformas</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedItem.platforms.map((platform, index) => (
                              <div
                                key={index}
                                className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg"
                              >
                                {getPlatformIcon(platform)}
                                <span className="ml-2 text-gray-800 dark:text-white">
                                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                        <div className="flex space-x-3">
                          <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors duration-300">
                            <FaEdit className="mr-2" />
                            Editar
                          </button>
                          <button className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors duration-300">
                            <FaShare className="mr-2" />
                            Compartir
                          </button>
                          <button
                            className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg flex items-center justify-center hover:bg-red-700 transition-colors duration-300"
                            onClick={() => handleDeleteItem(selectedItem.id)}
                          >
                            <FaTrash className="mr-2" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ContentPage;
