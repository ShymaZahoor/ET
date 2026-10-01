import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Shield,
  Activity,
  CheckCircle,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ecoTwinApi } from '../../services/api';
import { NotificationItem } from '../../types';
import { mockNotifications } from '../../data/mockData';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Dynamic real-time clock synced to the EcoTwin reference format: "Jan 14, 2025 14:32:08"
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) + ' ' + now.toLocaleTimeString('en-GB');
      setCurrentTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    ecoTwinApi.getNotifications().then(setNotifications);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    if (q.includes('leopard') || q.includes('village') || q.includes('inc-001')) {
      navigate('/app/incidents/INC-001');
    } else if (q.includes('cam') || q.includes('camera') || q.includes('detection')) {
      navigate('/app/live-detection');
    } else if (q.includes('threat')) {
      navigate('/app/threats');
    } else if (q.includes('map')) {
      navigate('/app/map');
    } else {
      navigate('/app/wildlife');
    }
  };

  const handleMarkAllRead = async () => {
    await ecoTwinApi.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="h-16 bg-[#07141F] border-b border-[#193348] px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Left: Mobile Toggle & Brand Logo */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#102433] transition-colors"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <Link to="/app" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#20D58A] to-[#19B7C9] flex items-center justify-center text-[#07141F] font-black shadow-[0_0_12px_rgba(32,213,138,0.35)]">
            <span className="text-base tracking-tighter">VD</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-[#20D58A] transition-colors">
              VanDristi
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline -mt-1 font-mono">
              Wildlife AI Platform
            </span>
          </div>
        </Link>
      </div>

      {/* Center: Global Search */}
      <div className="flex-1 max-w-xl mx-4 hidden md:block">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search location, animal, incident, camera..."
            className="w-full bg-[#0B1B28] border border-[#193348] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#20D58A] focus:ring-1 focus:ring-[#20D58A]/30 transition-all shadow-inner"
          />
        </form>
      </div>

      {/* Right: Operational Status, Clock & Actions */}
      <div className="flex items-center gap-3 lg:gap-4">
        {/* System Operational Status */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#0B1B28] border border-[#193348] text-xs">
          <div className="w-2 h-2 rounded-full bg-[#20D58A] animate-pulse" />
          <span className="text-slate-300 font-medium">All Systems Operational</span>
        </div>

        {/* Live Clock */}
        <div className="hidden lg:block text-right">
          <div className="text-xs font-mono tabular-nums text-slate-200 font-medium">
            {currentTime || 'Loading...'}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">Zone B · UTC+05:30</div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#102433] transition-colors"
          title="Toggle Theme"
        >
          {isDark ? <Moon className="w-4 h-4 text-[#19B7C9]" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#102433] transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#FF5148] text-[9px] font-bold text-white flex items-center justify-center ring-2 ring-[#07141F]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0B1B28] border border-[#193348] rounded-xl shadow-2xl p-4 z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#193348]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF5148]/20 text-[#FF5148] font-bold">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-[#20D58A] hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                  <button
                    onClick={() => setIsNotificationsOpen(false)}
                    className="text-slate-400 hover:text-white p-1 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="divide-y divide-[#193348] max-h-80 overflow-y-auto mt-2">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.link) {
                        navigate(item.link);
                        setIsNotificationsOpen(false);
                      }
                    }}
                    className={`py-2.5 px-1 cursor-pointer transition-colors ${
                      item.read ? 'opacity-70 hover:opacity-100' : 'bg-[#102433]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-xs text-white flex items-center gap-1.5">
                        {!item.read && <span className="w-1.5 h-1.5 rounded-full bg-[#FF5148]" />}
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-[#193348] text-center">
                <Link
                  to="/app/notifications"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-xs text-[#19B7C9] hover:underline font-medium"
                >
                  View All Notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Lockup */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#193348]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#19B7C9] to-[#20D58A] p-[1.5px] cursor-pointer shadow-sm">
            <div className="w-full h-full rounded-full bg-[#07141F] flex items-center justify-center font-bold text-xs text-[#20D58A]">
              A
            </div>
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-white leading-tight">Admin</span>
            <span className="text-[10px] text-[#20D58A] leading-tight font-mono">Field Operations</span>
          </div>
        </div>
      </div>
    </header>
  );
};
