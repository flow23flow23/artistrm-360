import React from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../components/ui/DashboardLayout';
import { FiUpload, FiFolder, FiImage, FiMusic, FiVideo, FiFile } from 'react-icons/fi';

export default function Content() {
  const router = useRouter();
  
  // Datos de ejemplo para el contenido
  const contentCategories = [
    { id: 'all', name: 'Todo', count: 347 },
    { id: 'audio', name: 'Audio', count: 215 },
    { id: 'images', name: 'Imágenes', count: 98 },
    { id: 'video', name: 'Videos', count: 24 },
    { id: 'documents', name: 'Documentos', count: 10 },
  ];
  
  const contentItems = [
    { id: 1, name: 'Nuevo Amanecer.mp3', type: 'audio', size: '8.4 MB', date: '2 días atrás', thumbnail: '/images/audio-thumbnail.jpg' },
    { id: 2, name: 'Portada Álbum.jpg', type: 'image', size: '2.1 MB', date: '3 días atrás', thumbnail: '/images/image-thumbnail.jpg' },
    { id: 3, name: 'Horizontes.wav', type: 'audio', size: '24.6 MB', date: '5 días atrás', thumbnail: '/images/audio-thumbnail.jpg' },
    { id: 4, name: 'Ensayo Estudio.mp4', type: 'video', size: '156 MB', date: '1 semana atrás', thumbnail: '/images/video-thumbnail.jpg' },
    { id: 5, name: 'Letra Canción.docx', type: 'document', size: '45 KB', date: '1 semana atrás', thumbnail: '/images/doc-thumbnail.jpg' },
    { id: 6, name: 'Sesión Fotos.jpg', type: 'image', size: '3.2 MB', date: '2 semanas atrás', thumbnail: '/images/image-thumbnail.jpg' },
  ];
  
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [viewMode, setViewMode] = React.useState('grid'); // 'grid' or 'list'
  
  // Filtrar contenido por categoría y búsqueda
  const filteredContent = contentItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.type === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Función para obtener el icono según el tipo de contenido
  const getContentIcon = (type: string) => {
    switch (type) {
      case 'audio':
        return <FiMusic className="h-6 w-6" />;
      case 'image':
        return <FiImage className="h-6 w-6" />;
      case 'video':
        return <FiVideo className="h-6 w-6" />;
      case 'document':
        return <FiFile className="h-6 w-6" />;
      default:
        return <FiFile className="h-6 w-6" />;
    }
  };

  // Función para obtener el color de fondo según el tipo de contenido
  const getContentBgColor = (type: string) => {
    switch (type) {
      case 'audio':
        return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      case 'image':
        return 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400';
      case 'video':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'document':
        return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contenido</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Gestiona tu biblioteca de contenido multimedia
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button 
              onClick={() => router.push('/content/upload')}
              className="btn btn-primary"
            >
              <FiUpload className="mr-2 h-4 w-4" />
              Subir Contenido
            </button>
          </div>
        </div>

        {/* Filters and search */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {contentCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar contenido..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-10 pr-4 py-2 w-full rounded-md"
            />
          </div>
        </div>

        {/* View mode toggle */}
        <div className="mb-6 flex justify-end">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                viewMode === 'grid'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              } border border-gray-300 dark:border-gray-600`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                viewMode === 'list'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              } border border-gray-300 dark:border-gray-600 border-l-0`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content grid/list */}
        {filteredContent.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredContent.map((item) => (
                <div 
                  key={item.id} 
                  className="card hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/content/${item.id}`)}
                >
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
                    <div className={`flex items-center justify-center h-full ${getContentBgColor(item.type)}`}>
                      {getContentIcon(item.type)}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</h3>
                    <div className="mt-1 flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{item.size}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{item.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">Nombre</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Tipo</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Tamaño</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {filteredContent.map((item) => (
                    <tr 
                      key={item.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => router.push(`/content/${item.id}`)}
                    >
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-8 w-8 rounded-md flex items-center justify-center ${getContentBgColor(item.type)}`}>
                            {getContentIcon(item.type)}
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400 capitalize">{item.type}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{item.size}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{item.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <FiFolder className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No se encontró contenido</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              No hay contenido que coincida con tus filtros.
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="btn btn-primary"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
