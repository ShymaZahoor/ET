import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const AppShell: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#07141F] text-slate-100 flex flex-col overflow-hidden">
      {/* Top Header */}
      <Header onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* Main App Body with Sidebar + Dynamic Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Collapsible Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Dynamic Route Viewport with auto scrolling */}
        <main className="flex-1 overflow-y-auto bg-[#07141F] p-4 lg:p-6 scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
