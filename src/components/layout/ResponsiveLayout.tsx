'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Layout Context
interface LayoutContextType {
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isClient: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const openSidebar = () => setIsSidebarOpen(true);

  const value: LayoutContextType = {
    isSidebarOpen,
    isSidebarCollapsed,
    isMobile,
    isTablet,
    isDesktop,
    isClient,
    toggleSidebar,
    closeSidebar,
    openSidebar,
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

export interface ResponsiveLayoutWrapperProps {
  children: React.ReactNode;
  accountType?: string;
  showSidebar?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
}

export const ResponsiveLayoutWrapper: React.FC<ResponsiveLayoutWrapperProps> = ({ 
  children 
}) => {
  return (
    <LayoutProvider>
      <div className="min-h-screen bg-gray-50">
        <main className="p-4">
          {children}
        </main>
      </div>
    </LayoutProvider>
  );
};

export default ResponsiveLayoutWrapper;