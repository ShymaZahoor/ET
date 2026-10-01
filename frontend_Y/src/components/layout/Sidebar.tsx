import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Video,
  Eye,
  AlertTriangle,
  MapPin,
  ShieldAlert,
  Users,
  Trees,
  BrainCircuit,
  BarChart3,
  Cpu,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Globe,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const navItems = [
    { label: 'Dashboard', path: '/app', icon: LayoutDashboard, exact: true },
    { label: 'Live Detection', path: '/app/live-detection', icon: Video },
    { label: 'Wildlife Monitoring', path: '/app/wildlife', icon: Eye },
    { label: 'Active Threats', path: '/app/threats', icon: AlertTriangle, badge: '3', badgeColor: 'bg-[#FF5148]' },
    { label: 'Map', path: '/app/map', icon: MapPin },
    { label: 'Incidents', path: '/app/incidents', icon: ShieldAlert },
    { label: 'Responder Teams', path: '/app/teams', icon: Users },
    { label: 'Habitat & Environment', path: '/app/habitat', icon: Trees },
    { label: 'Predictive Intelligence', path: '/app/predictive', icon: BrainCircuit },
    { label: 'Reports & Analytics', path: '/app/analytics', icon: BarChart3 },
    { label: 'AI & Data', path: '/app/ai-data', icon: Cpu },
    { label: 'Settings', path: '/app/settings', icon: Settings },
  ];

  return (
    <aside
      className={`bg-[#07141F] border-r border-[#193348] flex flex-col transition-all duration-300 select-none z-30 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Navigation Links */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                  isActive
                    ? 'bg-[#102433] text-[#20D58A] shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0B1B28]'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-[#20D58A]' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}

                  {/* Active highlight indicator bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#20D58A] rounded-r-full" />
                  )}

                  {/* Optional counter badge */}
                  {item.badge && !collapsed && (
                    <span
                      className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white ${
                        item.badgeColor || 'bg-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer Utilities */}
      <div className="p-3 border-t border-[#193348] space-y-1">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-[#19B7C9] hover:bg-[#0B1B28] transition-colors"
          title={collapsed ? 'Public Portal' : undefined}
        >
          <Globe className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Public Portal</span>}
        </NavLink>

        <NavLink
          to="/login"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-[#FF5148] hover:bg-[#0B1B28] transition-colors"
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </NavLink>

        {/* Collapse Sidebar Button */}
        <button
          onClick={onToggleCollapse}
          className="w-full mt-2 flex items-center justify-center p-2 rounded-lg bg-[#0B1B28] hover:bg-[#102433] text-slate-400 hover:text-white transition-colors border border-[#193348]"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="ml-2 text-[11px]">Collapse Menu</span>}
        </button>
      </div>
    </aside>
  );
};
