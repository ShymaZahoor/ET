import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const AppShell: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen w-full bg-[#07141F] text-slate-100 flex flex-col overflow-hidden">
      
      {/* Top Header */}
      <div className="shrink-0">
        <Header
          onToggleSidebar={() =>
            setSidebarCollapsed(!sidebarCollapsed)
          }
        />
      </div>

      {/* Main Application Area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        
        {/* Fixed Sidebar */}
        <div className="h-full shrink-0">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={() =>
              setSidebarCollapsed(!sidebarCollapsed)
            }
          />
        </div>

        {/* Main Content - ONLY THIS AREA SCROLLS */}
        <main className="flex-1 min-w-0 min-h-0 overflow-y-auto overflow-x-hidden bg-[#07141F] p-4 lg:p-6 scrollbar-thin">
          <Outlet />
        </main>
        
      </div>
    </div>
  );
};