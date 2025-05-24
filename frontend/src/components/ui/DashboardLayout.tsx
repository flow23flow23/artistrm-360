import React, { useState } from 'react';
import Sidebar from '../components/ui/Sidebar';
import Header from '../components/ui/Header';
import ZeusAssistant from '../components/zeus/ZeusAssistant';
import { FiMic } from 'react-icons/fi';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [zeusOpen, setZeusOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleZeus = () => {
    setZeusOpen(!zeusOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="md:pl-64">
        <Header toggleSidebar={toggleSidebar} toggleZeus={toggleZeus} />
        
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
      
      {/* Zeus floating button (mobile only) */}
      <div className="zeus-container md:hidden">
        <button 
          onClick={toggleZeus}
          className="zeus-button"
          aria-label="Zeus IA"
        >
          <FiMic className="h-6 w-6" />
        </button>
      </div>
      
      {/* Zeus assistant panel */}
      <ZeusAssistant isOpen={zeusOpen} toggleZeus={toggleZeus} />
    </div>
  );
};

export default DashboardLayout;
