import React, { useState } from 'react';
import {
  Settings,
  User,
  Bell,
  Map,
  Database,
  Users,
  Key,
  ShieldCheck,
  HelpCircle,
  Save,
  CheckCircle2,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [formData, setFormData] = useState({
    name: 'Admin User',
    email: 'admin@vandristi.org',
    role: 'Field Operations Commander',
    location: 'Ranthambore_Rajasthan',
    language: 'English (US)',
    autoAlerts: true,
    riskThreshold: '75',
    telemetryRefreshSecs: '5',
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const navItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'map', label: 'Map Preferences', icon: Map },
    { id: 'data', label: 'Data Settings', icon: Database },
    { id: 'team', label: 'Team Management', icon: Users },
    { id: 'api', label: 'API Access', icon: Key },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#193348]">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#20D58A]" />
          <h1 className="text-xl font-bold text-white tracking-tight">System Configuration & Settings</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Manage operational profiles, computer vision inference sensitivity, radio thresholds, and user access
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Settings Navigation Menu (Matches reference screen 15) */}
        <div className="md:col-span-4 lg:col-span-3 bg-[#0B1B28] border border-[#193348] rounded-xl p-3 space-y-1 h-fit">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#102433] text-[#20D58A] shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#07141F]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#20D58A]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Settings Content Form */}
        <div className="md:col-span-8 lg:col-span-9 bg-[#0B1B28] border border-[#193348] rounded-xl p-6 shadow-md">
          {activeSection === 'profile' && (
            <form onSubmit={handleSave} className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#193348]">
                <h3 className="font-bold text-white text-base">Profile Information</h3>
                <span className="text-xs text-slate-400 font-mono">ID: VD-OP-0042</span>
              </div>

              {savedSuccess && (
                <div className="p-3 bg-[#20D58A]/10 border border-[#20D58A]/30 rounded-lg text-xs text-[#20D58A] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Profile and field operational parameters updated successfully.</span>
                </div>
              )}

              {/* Avatar Row */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-[#19B7C9] to-[#20D58A] p-[2px]">
                  <div className="w-full h-full rounded-[10px] bg-[#07141F] flex items-center justify-center text-xl font-bold text-[#20D58A]">
                    A
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => alert('Photo upload dialog')}
                    className="text-xs font-semibold text-[#20D58A] hover:underline cursor-pointer"
                  >
                    Change Photo
                  </button>
                  <p className="text-[11px] text-slate-500 mt-0.5">JPG or PNG under 2MB</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#07141F] border border-[#193348] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#20D58A]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#07141F] border border-[#193348] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#20D58A]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Role Designation</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-[#07141F] border border-[#193348] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#20D58A]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Field Base Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-[#07141F] border border-[#193348] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#20D58A]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Interface Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full bg-[#07141F] border border-[#193348] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#20D58A]"
                  >
                    <option value="English (US)">English (US)</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Swahili">Swahili</option>
                    <option value="French">French</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[#193348] flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#20D58A] hover:bg-[#20D58A]/90 text-[#07141F] font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}

          {activeSection !== 'profile' && (
            <div className="space-y-4">
              <h3 className="font-bold text-white text-base capitalize">{activeSection} Preferences</h3>
              <p className="text-xs text-slate-400">
                Configure advanced operational rules for {activeSection}. Parameters are automatically validated against field station protocol.
              </p>
              <div className="p-4 bg-[#07141F] rounded-lg border border-[#193348] text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white">Enable Automated Escalation Dispatches</span>
                  <input type="checkbox" defaultChecked className="accent-[#20D58A]" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Continuous GPS Telemetry Refresh</span>
                  <span className="font-mono text-[#20D58A]">5 seconds</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Inference Confidence Filter Floor</span>
                  <span className="font-mono text-white">85.0%</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSavedSuccess(true);
                  setTimeout(() => setSavedSuccess(false), 2000);
                }}
                className="px-4 py-2 bg-[#20D58A] text-[#07141F] font-bold text-xs rounded-lg"
              >
                Apply Preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
