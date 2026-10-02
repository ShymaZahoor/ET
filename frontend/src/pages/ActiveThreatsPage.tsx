import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  AlertTriangle,
  Flame,
  Shield,
  Compass,
  Clock,
  Eye,
  Crosshair,
  Activity,
} from 'lucide-react';

import { ecoTwinApi } from '../services/api';
import { Threat } from '../types';

import { RiskBadge } from '../components/common/RiskBadge';
import { DispatchModal } from '../components/common/DispatchModal';


export const ActiveThreatsPage: React.FC = () => {
  const navigate = useNavigate();

  // ============================================================
  // BACKEND DATA
  // ============================================================

  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // FILTER
  // ============================================================

  const [activeTab, setActiveTab] = useState<
    'All' | 'Critical' | 'High' | 'Medium' | 'Watch'
  >('All');

  // ============================================================
  // DISPATCH MODAL
  // ============================================================

  const [dispatchTarget, setDispatchTarget] = useState<{
    id: string;
    title: string;
    location: string;
  } | null>(null);


  // ============================================================
  // LOAD THREATS FROM VANDRISTI BACKEND
  // ============================================================

  const loadThreats = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await ecoTwinApi.getThreats();

      setThreats(data);
    } catch (err) {
      console.error(
        'Failed to load active threats:',
        err
      );

      setError(
        'Unable to load active threat data from the Vandristi backend.'
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadThreats();
  }, []);


  // ============================================================
  // FILTER THREATS
  // ============================================================

  const filteredThreats = threats.filter((threat) => {
    if (activeTab === 'All') {
      return true;
    }

    if (activeTab === 'Critical') {
      return threat.status === 'Critical';
    }

    if (activeTab === 'High') {
      return (
        threat.status === 'High' ||
        threat.status === 'Critical'
      );
    }

    if (activeTab === 'Medium') {
      return threat.status === 'Warning';
    }

    if (activeTab === 'Watch') {
      return threat.status === 'Watch';
    }

    return true;
  });


  // ============================================================
  // COUNTS
  // ============================================================

  const criticalCount = threats.filter(
    (threat) => threat.status === 'Critical'
  ).length;

  const highCount = threats.filter(
    (threat) =>
      threat.status === 'High' ||
      threat.status === 'Critical'
  ).length;

  const mediumCount = threats.filter(
    (threat) => threat.status === 'Warning'
  ).length;

  const watchCount = threats.filter(
    (threat) => threat.status === 'Watch'
  ).length;


  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">

      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#193348]">

        <div>
          <div className="flex items-center gap-2">

            <Flame className="w-5 h-5 text-[#FF5148]" />

            <h1 className="text-xl font-bold text-white tracking-tight">
              Active Conflict Threats
            </h1>

          </div>

          <p className="text-xs text-slate-400 mt-1">
            Settlement geofence proximity evaluation, entry
            probability forecasting, and immediate tactical
            intervention
          </p>
        </div>


        <div className="flex items-center gap-2 flex-wrap">

          <span className="text-xs font-mono text-[#FF5148] bg-[#FF5148]/10 border border-[#FF5148]/30 px-3 py-1.5 rounded-lg font-bold">
            {criticalCount} Critical Escalation
          </span>

          <span className="text-xs font-mono text-slate-300 bg-[#102433] border border-[#193348] px-3 py-1.5 rounded-lg font-bold">
            {threats.length} Active Threats
          </span>

        </div>

      </div>


      {/* ========================================================
          LOADING
      ======================================================== */}

      {loading && (

        <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-10 text-center">

          <Activity className="w-8 h-8 mx-auto text-[#20D58A] animate-pulse mb-3" />

          <p className="text-sm text-slate-300">
            Loading active threats...
          </p>

          <p className="text-xs text-slate-500 mt-1">
            Connecting to Vandristi threat intelligence service
          </p>

        </div>

      )}


      {/* ========================================================
          ERROR
      ======================================================== */}

      {!loading && error && (

        <div className="bg-[#0B1B28] border border-[#FF5148]/40 rounded-xl p-8 text-center">

          <AlertTriangle className="w-8 h-8 mx-auto text-[#FF5148] mb-3" />

          <h4 className="font-semibold text-white">
            Threat Data Unavailable
          </h4>

          <p className="text-xs text-slate-400 mt-1">
            {error}
          </p>

          <button
            onClick={loadThreats}
            className="mt-4 px-4 py-2 bg-[#102433] hover:bg-[#193348] border border-[#193348] rounded-lg text-xs text-[#20D58A] font-semibold"
          >
            Retry
          </button>

        </div>

      )}


      {/* ========================================================
          MAIN CONTENT
      ======================================================== */}

      {!loading && !error && (

        <>

          {/* ====================================================
              TABS
          ==================================================== */}

          <div className="flex items-center gap-1.5 p-1 bg-[#0B1B28] border border-[#193348] rounded-xl w-fit flex-wrap">

            {(
              [
                'All',
                'Critical',
                'High',
                'Medium',
                'Watch',
              ] as const
            ).map((tab) => {

              let count = 0;

              if (tab === 'All') {
                count = threats.length;
              }

              if (tab === 'Critical') {
                count = criticalCount;
              }

              if (tab === 'High') {
                count = highCount;
              }

              if (tab === 'Medium') {
                count = mediumCount;
              }

              if (tab === 'Watch') {
                count = watchCount;
              }


              const isActive =
                activeTab === tab;


              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#20D58A] text-[#07141F] shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-[#102433]'
                  }`}
                >

                  <span>
                    {tab}
                  </span>

                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                      isActive
                        ? 'bg-[#07141F] text-[#20D58A]'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>

                </button>
              );

            })}

          </div>


          {/* ====================================================
              THREAT CARDS
          ==================================================== */}

          {filteredThreats.length > 0 && (

            <div className="space-y-4">

              {filteredThreats.map((threat) => (

                <div
                  key={threat.id}
                  className={`bg-[#0B1B28] border rounded-xl p-5 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all ${
                    threat.status === 'Critical'
                      ? 'border-[#FF5148]/60 hover:border-[#FF5148]'
                      : threat.status === 'Warning'
                      ? 'border-[#F4B740]/40 hover:border-[#F4B740]'
                      : 'border-[#193348] hover:border-slate-500'
                  }`}
                >

                  {/* ==================================================
                      LEFT - ANIMAL PROFILE
                  ================================================== */}

                  <div className="flex items-start sm:items-center gap-4 min-w-[280px]">

                    <img
                      src={threat.image}
                      alt={threat.species}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-[#193348] shrink-0"
                    />

                    <div>

                      <div className="flex items-center gap-2">

                        <span className="font-mono text-xs text-[#19B7C9] font-bold">
                          {threat.trackId}
                        </span>

                        <RiskBadge
                          level={threat.status}
                          size="sm"
                        />

                      </div>


                      <h3 className="text-lg font-bold text-white leading-tight mt-1">
                        {threat.species}
                      </h3>


                      <p className="text-xs text-slate-400 mt-0.5">
                        {threat.location}
                      </p>


                      <div className="text-[11px] text-slate-500 font-mono mt-1">
                        Speed: {threat.speed}
                        {' · '}
                        Vector: {threat.direction}
                      </div>

                    </div>

                  </div>


                  {/* ==================================================
                      CENTER - METRICS
                  ================================================== */}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1 max-w-2xl bg-[#07141F] p-3.5 rounded-xl border border-[#193348]">

                    {/* Risk Score */}

                    <div>

                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Risk Score
                      </span>

                      <div className="mt-1 flex items-baseline gap-1">

                        <span className="text-xl font-bold font-mono text-[#FF5148] tabular-nums">
                          {threat.riskScore}
                        </span>

                        <span className="text-slate-500 text-xs">
                          / 100
                        </span>

                      </div>

                      <div className="w-full bg-[#102433] h-1.5 rounded-full mt-1.5 overflow-hidden">

                        <div
                          className="bg-[#FF5148] h-full rounded-full"
                          style={{
                            width: `${Math.min(
                              Math.max(
                                Number(threat.riskScore) || 0,
                                0
                              ),
                              100
                            )}%`,
                          }}
                        />

                      </div>

                    </div>


                    {/* Entry Probability */}

                    <div>

                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Entry Probability
                      </span>

                      <div className="mt-1 flex items-baseline gap-1">

                        <span className="text-xl font-bold font-mono text-amber-400 tabular-nums">
                          {threat.entryProbability}%
                        </span>

                      </div>

                      <div className="w-full bg-[#102433] h-1.5 rounded-full mt-1.5 overflow-hidden">

                        <div
                          className="bg-amber-400 h-full rounded-full"
                          style={{
                            width: `${Math.min(
                              Math.max(
                                Number(
                                  threat.entryProbability
                                ) || 0,
                                0
                              ),
                              100
                            )}%`,
                          }}
                        />

                      </div>

                    </div>


                    {/* ETA */}

                    <div>

                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        ETA to Zone
                      </span>

                      <div className="mt-1">

                        <span className="text-lg font-bold font-mono text-white tabular-nums">
                          {threat.eta}
                        </span>

                      </div>

                      <span className="text-[10px] text-slate-400 font-mono">
                        Continuous Calc
                      </span>

                    </div>


                    {/* Target Zone */}

                    <div>

                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Target Zone
                      </span>

                      <div className="mt-1">

                        <span className="text-xs font-semibold text-[#19B7C9] truncate block">
                          {threat.zoneName}
                        </span>

                      </div>

                      <span className="text-[10px] text-slate-400 font-mono">
                        {threat.distanceToZone} away
                      </span>

                    </div>

                  </div>


                  {/* ==================================================
                      RIGHT - ACTIONS
                  ================================================== */}

                  <div className="flex sm:flex-col gap-2 shrink-0">

                    {/* Assign Team */}

                    <button
                      onClick={() =>
                        setDispatchTarget({
                          id: threat.trackId,
                          title: `Threat Intervention: ${threat.species} (${threat.trackId})`,
                          location: threat.location,
                        })
                      }
                      className="flex-1 sm:flex-initial px-4 py-2 bg-[#FF5148] hover:bg-[#FF5148]/90 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow"
                    >

                      <Shield className="w-3.5 h-3.5" />

                      <span>
                        Assign Team
                      </span>

                    </button>


                    {/* Track Path */}

                    <button
                      onClick={() =>
                        navigate(
                          `/app/predictive?trackId=${encodeURIComponent(
                            threat.trackId
                          )}`
                        )
                      }
                      className="flex-1 sm:flex-initial px-4 py-2 bg-[#102433] hover:bg-[#193348] text-[#20D58A] border border-[#20D58A]/30 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >

                      <Compass className="w-3.5 h-3.5" />

                      <span>
                        Track Path
                      </span>

                    </button>


                    {/* View Dossier */}

                    <button
                      onClick={() =>
                        navigate(
                          `/app/incidents?trackId=${encodeURIComponent(
                            threat.trackId
                          )}`
                        )
                      }
                      className="flex-1 sm:flex-initial px-4 py-2 bg-[#07141F] hover:bg-[#102433] text-slate-300 font-semibold text-xs rounded-lg transition-colors border border-[#193348] text-center"
                    >
                      View Dossier
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}


          {/* ====================================================
              EMPTY STATE
          ==================================================== */}

          {filteredThreats.length === 0 && (

            <div className="text-center py-12 bg-[#0B1B28] border border-[#193348] rounded-xl">

              <Eye className="w-8 h-8 mx-auto text-slate-500 mb-3" />

              <h4 className="font-semibold text-white">
                No Threats Found
              </h4>

              <p className="text-xs text-slate-400 mt-1">
                There are no threats matching the selected
                filter.
              </p>

              {activeTab !== 'All' && (

                <button
                  onClick={() => setActiveTab('All')}
                  className="mt-4 px-4 py-1.5 bg-[#102433] hover:bg-[#193348] border border-[#193348] rounded-lg text-xs text-[#20D58A] font-semibold"
                >
                  Show All Threats
                </button>

              )}

            </div>

          )}

        </>

      )}


      {/* ========================================================
          DISPATCH MODAL
      ======================================================== */}

      {dispatchTarget && (

        <DispatchModal
          isOpen={!!dispatchTarget}

          onClose={() =>
            setDispatchTarget(null)
          }

          targetId={dispatchTarget.id}

          targetTitle={dispatchTarget.title}

          targetLocation={dispatchTarget.location}

          onSuccess={() => {
            setDispatchTarget(null);
            loadThreats();
          }}
        />

      )}

    </div>
  );
};