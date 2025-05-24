import React from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/ui/DashboardLayout';
import Link from 'next/link';
import { FiPlus, FiMusic, FiFolder, FiBarChart2, FiUsers } from 'react-icons/fi';

export default function Dashboard() {
  const { user } = useAuth();
  
  // Datos de ejemplo para el dashboard
  const stats = [
    { id: 1, name: 'Proyectos Activos', value: '12', icon: FiFolder, change: '+2', changeType: 'increase' },
    { id: 2, name: 'Contenido Total', value: '347', icon: FiMusic, change: '+15', changeType: 'increase' },
    { id: 3, name: 'Reproducciones', value: '24.5K', icon: FiBarChart2, change: '+18%', changeType: 'increase' },
    { id: 4, name: 'Seguidores', value: '8.2K', icon: FiUsers, change: '+5%', changeType: 'increase' },
  ];
  
  const recentProjects = [
    { id: 1, name: 'Álbum Nuevo Amanecer', progress: 75, dueDate: '15 Jun 2025' },
    { id: 2, name: 'Gira Nacional 2025', progress: 40, dueDate: '30 Jul 2025' },
    { id: 3, name: 'Videoclip "Horizontes"', progress: 90, dueDate: '5 Jun 2025' },
  ];
  
  const recentContent = [
    { id: 1, name: 'Canción - Nuevo Amanecer.mp3', type: 'audio', date: '2 días atrás' },
    { id: 2, name: 'Portada - Álbum.jpg', type: 'image', date: '3 días atrás' },
    { id: 3, name: 'Demo - Horizontes.wav', type: 'audio', date: '5 días atrás' },
  ];

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        {/* Welcome section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Bienvenido, {user?.displayName || 'Artista'}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Aquí tienes un resumen de tu actividad reciente y estadísticas
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.id} className="dashboard-stat">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</div>
                <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="dashboard-stat-value">{stat.value}</div>
              <div className={`mt-1 text-sm font-medium ${
                stat.changeType === 'increase' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {stat.change}
              </div>
            </div>
          ))}
        </div>

        {/* Recent projects and content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent projects */}
          <div className="card">
            <div className="card-header flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Proyectos Recientes</h2>
              <Link href="/projects/new" className="btn btn-primary btn-sm">
                <FiPlus className="mr-1 h-4 w-4" />
                Nuevo
              </Link>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div key={project.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center mb-1">
                      <Link href={`/projects/${project.id}`} className="text-sm font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
                        {project.name}
                      </Link>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Vence: {project.dueDate}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Progreso: {project.progress}%
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Link href="/projects" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-800 dark:hover:text-indigo-300">
                  Ver todos los proyectos
                </Link>
              </div>
            </div>
          </div>

          {/* Recent content */}
          <div className="card">
            <div className="card-header flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Contenido Reciente</h2>
              <Link href="/content/upload" className="btn btn-primary btn-sm">
                <FiPlus className="mr-1 h-4 w-4" />
                Subir
              </Link>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {recentContent.map((content) => (
                  <div key={content.id} className="flex items-center border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-md flex items-center justify-center ${
                      content.type === 'audio' 
                        ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' 
                        : 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400'
                    }`}>
                      {content.type === 'audio' ? (
                        <FiMusic className="h-5 w-5" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <Link href={`/content/${content.id}`} className="text-sm font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
                        {content.name}
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Subido {content.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Link href="/content" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-800 dark:hover:text-indigo-300">
                  Ver todo el contenido
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
