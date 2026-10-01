import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Eye,
  AlertTriangle,
  ShieldCheck,
  Clock,
  Download,
  Calendar,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { ecoTwinApi } from '../services/api';

export const ReportsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('Last 24 Hours');
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    ecoTwinApi.getAnalyticsData(timeRange).then(setAnalytics);
  }, [timeRange]);

  if (!analytics) {
    return <div className="p-8 text-center text-slate-400">Loading Analytics Intelligence...</div>;
  }

  const responseTimeData = [
    { team: 'Team 1', time: 7.2 },
    { team: 'Team 2', time: 12.0 },
    { team: 'Team 3', time: 6.4 },
    { team: 'Team 4', time: 24.5 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#193348]">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#20D58A]" />
            <h1 className="text-xl font-bold text-white tracking-tight">Reports & Analytics Intelligence</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated computer vision sightings, human-wildlife conflict averted, and tactical response metrics
          </p>
        </div>

        {/* Time Filter Dropdown & Export */}
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            aria-label="Select report time window"
            className="bg-[#0B1B28] border border-[#193348] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#20D58A]"
          >
            <option value="Last 24 Hours">Last 24 Hours</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Last 90 Days">Last 90 Days</option>
          </select>

          <button
            onClick={() => alert('Exporting full analytics report as CSV...')}
            className="px-3 py-1.5 bg-[#102433] hover:bg-[#193348] text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-[#193348] transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row (Matches Section 16 & reference design) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* KPI 1: Total Sightings */}
        <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Sightings</span>
            <Eye className="w-4 h-4 text-[#20D58A]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              {analytics.totalSightings}
            </span>
            <span className="text-xs text-[#20D58A] flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +12%
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">In Reserve Sector B</span>
        </div>

        {/* KPI 2: Threats Detected */}
        <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Threats Detected</span>
            <AlertTriangle className="w-4 h-4 text-[#FF5148]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#FF5148] font-mono tabular-nums">
              {analytics.threatsDetected}
            </span>
            <span className="text-xs text-[#20D58A]">-10%</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Conflict Alerts Triggered</span>
        </div>

        {/* KPI 3: Incidents Handled */}
        <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Incidents Handled</span>
            <ShieldCheck className="w-4 h-4 text-[#19B7C9]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              {analytics.incidentsHandled}
            </span>
            <span className="text-xs text-[#19B7C9]">+25%</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Zero Human Casualties</span>
        </div>

        {/* KPI 4: Response Success */}
        <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Response Success</span>
            <ShieldCheck className="w-4 h-4 text-[#20D58A]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-[#20D58A] font-mono tabular-nums">
              {analytics.responseSuccess}%
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Conflicts Averted</span>
        </div>

        {/* KPI 5: Avg Response Time */}
        <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Avg Response Time</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              {analytics.avgResponseTime}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Detection to Dispatch</span>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Wildlife Sightings Trend Line Chart (7 cols on lg) */}
        <div className="lg:col-span-7 bg-[#0B1B28] border border-[#193348] rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-[#193348] mb-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-wide">
              Wildlife Sightings Trend
            </h3>
            <span className="text-xs text-slate-400 font-mono">By Time of Day</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.sightingsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#193348" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1B28', borderColor: '#193348', color: '#FFF' }}
                />
                <Line
                  type="monotone"
                  dataKey="Leopard"
                  stroke="#FF5148"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="Elephant"
                  stroke="#39A9FF"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="Boar"
                  stroke="#F4B740"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="Deer"
                  stroke="#20D58A"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5148]" /> Leopard
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-[#39A9FF]" /> Elephant
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F4B740]" /> Wild Boar
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-[#20D58A]" /> Deer
            </span>
          </div>
        </div>

        {/* Species Distribution Donut Chart (5 cols on lg) */}
        <div className="lg:col-span-5 bg-[#0B1B28] border border-[#193348] rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#193348] mb-2">
            <h3 className="font-bold text-white text-xs uppercase tracking-wide">
              Species Distribution
            </h3>
            <span className="text-xs text-slate-400 font-mono">Total: 72 Sightings</span>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.speciesDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {analytics.speciesDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#07141F" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1B28', borderColor: '#193348', color: '#FFF' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center pointer-events-none">
              <span className="text-xl font-bold font-mono text-white">72</span>
              <span className="text-[10px] text-slate-400">Total</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#193348]">
            {analytics.speciesDistribution.map((item: any) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-mono text-slate-400 font-semibold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Responder Team Response Time Bar Chart */}
      <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-5 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-[#193348] mb-4">
          <h3 className="font-bold text-white text-xs uppercase tracking-wide">
            Unit Dispatch & Deployment Time (Minutes)
          </h3>
          <span className="text-xs text-[#20D58A] font-semibold">Average: 6.4 minutes</span>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#193348" />
              <XAxis dataKey="team" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} unit="m" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B1B28', borderColor: '#193348', color: '#FFF' }}
              />
              <Bar dataKey="time" fill="#20D58A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
