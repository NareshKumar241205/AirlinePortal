import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const MainLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-collapse sidebar on mobile
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    // Check initial screen size
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isCollapsed}
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
        closeSidebar={closeSidebar}
      />

      {/* Main Content Area */}
      <div 
        className={`
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'ml-0 md:ml-16' : 'ml-0 md:ml-64'}
        `}
      >
        {/* Top Bar */}
        <TopBar 
          toggleSidebar={toggleSidebar}
          isCollapsed={isCollapsed}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;