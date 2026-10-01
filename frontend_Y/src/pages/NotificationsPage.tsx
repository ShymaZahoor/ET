import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Shield,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { ecoTwinApi } from '../services/api';
import { NotificationItem } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<'All' | 'Critical' | 'High' | 'Medium' | 'Low' | 'Info'>('All');

  useEffect(() => {
    ecoTwinApi.getNotifications().then(setNotifications);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await ecoTwinApi.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllRead = async () => {
    await ecoTwinApi.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filtered = notifications.filter((n) => {
    if (activeCategory === 'All') return true;
    return n.category === activeCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#193348]">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#20D58A]" />
            <h1 className="text-xl font-bold text-white tracking-tight">System & Tactical Notifications</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time automated incident triggers, ranger dispatch updates, and sensor telemetry alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="px-3 py-1.5 bg-[#0B1B28] hover:bg-[#102433] text-[#20D58A] border border-[#20D58A]/30 rounded-lg text-xs font-semibold transition-colors"
          >
            Mark All as Read
          </button>
        </div>
      </div>

      {/* Category Filter Pills (Directly from reference design screen 16) */}
      <div className="flex items-center gap-1.5 p-1 bg-[#0B1B28] border border-[#193348] rounded-xl w-fit">
        {(['All', 'Critical', 'High', 'Medium', 'Low', 'Info'] as const).map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#20D58A] text-[#07141F] shadow'
                  : 'text-slate-400 hover:text-white hover:bg-[#102433]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => handleMarkAsRead(item.id)}
            className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer ${
              item.read
                ? 'bg-[#0B1B28] border-[#193348] opacity-75 hover:opacity-100'
                : 'bg-[#102433] border-[#20D58A]/40 shadow-md'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {!item.read ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5148] block animate-pulse" />
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600 block" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">{item.title}</h3>
                  <RiskBadge level={item.category} size="sm" />
                </div>
                <p className="text-xs text-slate-300 mt-1">{item.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
              <span className="text-xs font-mono text-slate-400">{item.time}</span>
              {item.link && (
                <Link
                  to={item.link}
                  className="px-3 py-1 bg-[#07141F] hover:bg-[#193348] text-[#19B7C9] border border-[#193348] rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <span>Review</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
