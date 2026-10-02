import React, { useState, useEffect } from 'react';

import {
  Eye,
  Search,
  Filter,
  ArrowUpDown,
  Navigation,
  Compass,
  AlertTriangle,
  Clock,
  Activity,
  X,
  Shield,
  Layers,
} from 'lucide-react';

import { ecoTwinApi } from '../services/api';

import { Animal } from '../types';

import { RiskBadge } from '../components/common/RiskBadge';

import { StatusBadge } from '../components/common/StatusBadge';

import { useNavigate } from 'react-router-dom';


export const WildlifeMonitoringPage: React.FC = () => {

  const navigate = useNavigate();


  // ============================================================
  // LIVE BACKEND DATA
  // ============================================================

  const [animals, setAnimals] = useState<Animal[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);


  // ============================================================
  // FILTER / SORT STATE
  // ============================================================

  const [search, setSearch] = useState('');

  const [speciesFilter, setSpeciesFilter] = useState('All');

  const [riskFilter, setRiskFilter] = useState('All');

  const [statusFilter, setStatusFilter] = useState('All');

  const [sortBy, setSortBy] =
    useState<'recent' | 'risk' | 'speed'>('risk');


  // ============================================================
  // SELECTED ANIMAL
  // ============================================================

  const [selectedAnimal, setSelectedAnimal] =
    useState<Animal | null>(null);


  // ============================================================
  // LOAD ANIMALS FROM VANDRISTI BACKEND
  // ============================================================

  useEffect(() => {

    const loadAnimals = async () => {

      try {

        setLoading(true);

        setError(null);

        const data = await ecoTwinApi.getAnimals();

        setAnimals(data);

      } catch (err) {

        console.error(
          'Failed to load wildlife monitoring data:',
          err
        );

        setError(
          'Unable to load wildlife tracking data from the Vandristi backend.'
        );

      } finally {

        setLoading(false);

      }

    };


    loadAnimals();

  }, []);


  // ============================================================
  // DYNAMIC FILTER OPTIONS
  // ============================================================

  const speciesOptions = Array.from(
    new Set(animals.map((animal) => animal.species))
  ).sort();


  const riskOptions = Array.from(
    new Set(animals.map((animal) => animal.riskLevel))
  ).sort();


  const statusOptions = Array.from(
    new Set(animals.map((animal) => animal.status))
  ).sort();


  // ============================================================
  // FILTER + SORT
  // ============================================================

  const filteredAnimals = animals

    .filter((animal) => {

      const searchTerm = search.toLowerCase().trim();

      const matchSearch =
        !searchTerm ||
        animal.species.toLowerCase().includes(searchTerm) ||
        animal.trackId.toLowerCase().includes(searchTerm) ||
        animal.location.toLowerCase().includes(searchTerm);


      const matchSpecies =
        speciesFilter === 'All' ||
        animal.species === speciesFilter;


      const matchRisk =
        riskFilter === 'All' ||
        animal.riskLevel === riskFilter;


      const matchStatus =
        statusFilter === 'All' ||
        animal.status === statusFilter;


      return (
        matchSearch &&
        matchSpecies &&
        matchRisk &&
        matchStatus
      );

    })

    .sort((a, b) => {

      if (sortBy === 'risk') {

        const weights: Record<string, number> = {
          Critical: 4,
          High: 3,
          Monitoring: 2,
          Normal: 1,
        };

        return (
          (weights[b.riskLevel] || 0) -
          (weights[a.riskLevel] || 0)
        );

      }


      if (sortBy === 'speed') {

        const speedA =
          parseFloat(String(a.speed).replace(/[^\d.]/g, '')) || 0;

        const speedB =
          parseFloat(String(b.speed).replace(/[^\d.]/g, '')) || 0;

        return speedB - speedA;

      }


      // Recent
      return 0;

    });


  // ============================================================
  // COUNTS
  // ============================================================

  const criticalCount = animals.filter(
    (animal) => animal.riskLevel === 'Critical'
  ).length;


  const highRiskCount = animals.filter(
    (animal) => animal.riskLevel === 'High'
  ).length;


  // ============================================================
  // RENDER
  // ============================================================

  return (

    <div className="space-y-6">

      {/* ========================================================
          PAGE HEADER
      ======================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#193348]">

        <div>

          <div className="flex items-center gap-2">

            <Eye className="w-5 h-5 text-[#20D58A]" />

            <h1 className="text-xl font-bold text-white tracking-tight">
              Wildlife Monitoring & Tracking
            </h1>

          </div>


          <p className="text-xs text-slate-400 mt-1">
            Real-time ByteTrack trajectory IDs, velocity vectors,
            geofence status, and animal risk profiles
          </p>

        </div>


        <div className="flex items-center gap-2 flex-wrap">

          <span className="text-xs font-mono text-[#20D58A] bg-[#20D58A]/10 border border-[#20D58A]/30 px-3 py-1.5 rounded-lg font-bold">
            {animals.length} Active Tracks
          </span>


          {criticalCount > 0 && (

            <span className="text-xs font-mono text-[#FF5148] bg-[#FF5148]/10 border border-[#FF5148]/30 px-3 py-1.5 rounded-lg font-bold">
              {criticalCount} Critical
            </span>

          )}


          {highRiskCount > 0 && (

            <span className="text-xs font-mono text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1.5 rounded-lg font-bold">
              {highRiskCount} High Risk
            </span>

          )}

        </div>

      </div>


      {/* ========================================================
          LOADING STATE
      ======================================================== */}

      {loading && (

        <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-10 text-center">

          <Activity className="w-7 h-7 mx-auto text-[#20D58A] animate-pulse mb-3" />

          <p className="text-sm text-slate-300">
            Loading wildlife tracking data...
          </p>

          <p className="text-xs text-slate-500 mt-1">
            Connecting to Vandristi backend
          </p>

        </div>

      )}


      {/* ========================================================
          ERROR STATE
      ======================================================== */}

      {!loading && error && (

        <div className="bg-[#0B1B28] border border-[#FF5148]/40 rounded-xl p-8 text-center">

          <AlertTriangle className="w-8 h-8 mx-auto text-[#FF5148] mb-3" />

          <h4 className="font-semibold text-white">
            Wildlife Data Unavailable
          </h4>

          <p className="text-xs text-slate-400 mt-1">
            {error}
          </p>

        </div>

      )}


      {!loading && !error && (

        <>

          {/* ======================================================
              FILTER + SEARCH BAR
          ====================================================== */}

          <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-4 shadow-sm flex flex-wrap gap-3 items-center justify-between">

            {/* Search */}

            <div className="relative flex-1 min-w-[220px]">

              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Track ID, Species, or Location..."
                className="w-full bg-[#07141F] border border-[#193348] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#20D58A]"
              />

            </div>


            {/* Filter Dropdowns */}

            <div className="flex flex-wrap items-center gap-2">

              {/* Species */}

              <select
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
                aria-label="Filter by Species"
                className="bg-[#07141F] border border-[#193348] rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-[#20D58A]"
              >

                <option value="All">
                  All Species
                </option>

                {speciesOptions.map((species) => (

                  <option
                    key={species}
                    value={species}
                  >
                    {species}
                  </option>

                ))}

              </select>


              {/* Risk Level */}

              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                aria-label="Filter by Risk Level"
                className="bg-[#07141F] border border-[#193348] rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-[#20D58A]"
              >

                <option value="All">
                  All Risk
                </option>

                {riskOptions.map((risk) => (

                  <option
                    key={risk}
                    value={risk}
                  >
                    {risk}
                  </option>

                ))}

              </select>


              {/* Status */}

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by Status"
                className="bg-[#07141F] border border-[#193348] rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-[#20D58A]"
              >

                <option value="All">
                  All Status
                </option>

                {statusOptions.map((status) => (

                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>

                ))}

              </select>


              {/* Sort */}

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as
                      | 'recent'
                      | 'risk'
                      | 'speed'
                  )
                }
                aria-label="Sort animals by"
                className="bg-[#07141F] border border-[#193348] rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-[#20D58A]"
              >

                <option value="risk">
                  Sort by Risk
                </option>

                <option value="speed">
                  Sort by Speed
                </option>

                <option value="recent">
                  Sort by Recent
                </option>

              </select>

            </div>

          </div>


          {/* ======================================================
              TRACKED ANIMALS GRID
          ====================================================== */}

          {filteredAnimals.length > 0 && (

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

              {filteredAnimals.map((animal) => (

                <div
                  key={animal.id}
                  className="bg-[#0B1B28] border border-[#193348] rounded-xl p-4 flex flex-col justify-between hover:border-slate-500 transition-all shadow-md group"
                >

                  <div>

                    {/* Track ID + Risk */}

                    <div className="flex items-center justify-between mb-3">

                      <span className="font-mono text-xs text-[#19B7C9] font-bold">
                        {animal.trackId}
                      </span>

                      <RiskBadge
                        level={animal.riskLevel}
                        size="sm"
                      />

                    </div>


                    {/* Animal Photo */}

                    <div className="relative aspect-video rounded-lg overflow-hidden border border-[#193348] mb-3 bg-[#07141F]">

                      <img
                        src={animal.image}
                        alt={animal.species}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />


                      <div className="absolute top-2 right-2">

                        <StatusBadge
                          status={animal.status}
                          size="sm"
                        />

                      </div>

                    </div>


                    {/* Title + Location */}

                    <h3 className="font-bold text-white text-base leading-tight">
                      {animal.species}
                    </h3>


                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">

                      <Navigation className="w-3.5 h-3.5 text-[#19B7C9]" />

                      <span className="truncate">
                        {animal.location}
                      </span>

                    </p>


                    {/* Metrics */}

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-[#07141F] p-2.5 rounded-lg border border-[#193348]">

                      <div>

                        <span className="text-slate-500 text-[10px] uppercase font-semibold block">
                          Velocity
                        </span>

                        <span className="font-mono font-bold text-white tabular-nums">
                          {animal.speed}
                        </span>

                      </div>


                      <div>

                        <span className="text-slate-500 text-[10px] uppercase font-semibold block">
                          Heading
                        </span>

                        <span className="text-[#20D58A] font-medium">
                          {animal.direction}
                        </span>

                      </div>


                      <div>

                        <span className="text-slate-500 text-[10px] uppercase font-semibold block">
                          Last Seen
                        </span>

                        <span className="text-slate-300 font-mono">
                          {animal.lastSeen}
                        </span>

                      </div>


                      <div>

                        <span className="text-slate-500 text-[10px] uppercase font-semibold block">
                          Status
                        </span>

                        <span className="text-slate-300 font-medium">
                          {animal.status}
                        </span>

                      </div>

                    </div>

                  </div>


                  {/* ==================================================
                      ACTION BUTTONS
                  ================================================== */}

                  <div className="mt-4 pt-3 border-t border-[#193348] flex items-center gap-2">

                    <button
                      onClick={() =>
                        setSelectedAnimal(animal)
                      }
                      className="flex-1 py-1.5 px-3 bg-[#102433] hover:bg-[#193348] text-[#20D58A] hover:text-white rounded-lg text-xs font-semibold transition-colors text-center border border-[#193348]"
                    >
                      Telemetry Dossier
                    </button>


                    {animal.riskLevel === 'Critical' && (

                      <button
                        onClick={() => {

                          /*
                           * We currently don't have a dedicated
                           * animal -> incident endpoint in the
                           * frontend API layer.
                           *
                           * Therefore, only navigate to the
                           * incidents page instead of inventing
                           * an INC-001 relationship.
                           */

                          navigate('/app/incidents');

                        }}
                        className="py-1.5 px-2.5 bg-[#FF5148] hover:bg-[#FF5148]/90 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        Incident
                      </button>

                    )}

                  </div>

                </div>

              ))}

            </div>

          )}


          {/* ======================================================
              NO MATCHING ANIMALS
          ====================================================== */}

          {filteredAnimals.length === 0 && (

            <div className="text-center py-12 bg-[#0B1B28] border border-[#193348] rounded-xl text-slate-400">

              <AlertTriangle className="w-8 h-8 mx-auto text-amber-400 mb-2" />

              <h4 className="font-semibold text-white">
                No Animals Matched Filter Criteria
              </h4>

              <p className="text-xs mt-1">
                Try resetting the species or risk level filters above.
              </p>

              <button
                onClick={() => {

                  setSearch('');
                  setSpeciesFilter('All');
                  setRiskFilter('All');
                  setStatusFilter('All');

                }}
                className="mt-4 px-3 py-1.5 bg-[#102433] hover:bg-[#193348] border border-[#193348] rounded-lg text-xs text-[#20D58A] font-semibold"
              >
                Reset Filters
              </button>

            </div>

          )}

        </>

      )}


      {/* ==========================================================
          ANIMAL DETAILED TRACKING MODAL
      ========================================================== */}

      {selectedAnimal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">

          <div className="bg-[#0B1B28] border border-[#193348] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in duration-200">

            {/* Modal Header */}

            <div className="px-5 py-4 border-b border-[#193348] flex items-center justify-between bg-[#102433]/70">

              <div className="flex items-center gap-2">

                <span className="font-mono text-sm font-bold text-[#19B7C9]">
                  {selectedAnimal.trackId}
                </span>

                <span className="text-white font-bold">
                  · {selectedAnimal.species}
                </span>

              </div>


              <button
                onClick={() =>
                  setSelectedAnimal(null)
                }
                className="text-slate-400 hover:text-white p-1 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

            </div>


            {/* Modal Content */}

            <div className="p-5 space-y-4">

              <img
                src={selectedAnimal.image}
                alt={selectedAnimal.species}
                className="w-full h-48 object-cover rounded-lg border border-[#193348]"
              />


              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">

                <div className="bg-[#07141F] p-2.5 rounded-lg border border-[#193348]">

                  <span className="text-slate-500 block text-[10px] font-semibold">
                    Risk Level
                  </span>

                  <RiskBadge
                    level={selectedAnimal.riskLevel}
                    size="sm"
                  />

                </div>


                <div className="bg-[#07141F] p-2.5 rounded-lg border border-[#193348]">

                  <span className="text-slate-500 block text-[10px] font-semibold">
                    Speed / Rate
                  </span>

                  <span className="text-white font-mono font-bold text-sm">
                    {selectedAnimal.speed}
                  </span>

                </div>


                <div className="bg-[#07141F] p-2.5 rounded-lg border border-[#193348]">

                  <span className="text-slate-500 block text-[10px] font-semibold">
                    Heading
                  </span>

                  <span className="text-[#20D58A] font-semibold text-sm">
                    {selectedAnimal.direction}
                  </span>

                </div>

              </div>


              {/* Tracking Information */}

              <div className="bg-[#07141F] p-3 rounded-lg border border-[#193348] text-xs space-y-2">

                <div className="flex justify-between gap-4">

                  <span className="text-slate-400">
                    GPS Coordinates:
                  </span>

                  <span className="text-white font-mono text-right">
                    {selectedAnimal.coordinates.join(', ')}
                  </span>

                </div>


                <div className="flex justify-between gap-4">

                  <span className="text-slate-400">
                    Current Fix Location:
                  </span>

                  <span className="text-white text-right">
                    {selectedAnimal.location}
                  </span>

                </div>


                <div className="flex justify-between gap-4">

                  <span className="text-slate-400">
                    Tracking Algorithm:
                  </span>

                  <span className="text-[#19B7C9] font-mono text-right">
                    ByteTrack Kalman Filter v2.1
                  </span>

                </div>


                <div className="flex justify-between gap-4">

                  <span className="text-slate-400">
                    Track Status:
                  </span>

                  <span className="text-[#20D58A] font-medium">
                    {selectedAnimal.status}
                  </span>

                </div>

              </div>

            </div>


            {/* Modal Footer */}

            <div className="px-5 py-3 border-t border-[#193348] flex items-center justify-end gap-2 bg-[#102433]/70">

              <button
                onClick={() =>
                  setSelectedAnimal(null)
                }
                className="px-4 py-1.5 text-xs text-slate-300 hover:text-white"
              >
                Close
              </button>


              <button
                onClick={() => {

                  const trackId =
                    selectedAnimal.trackId;

                  setSelectedAnimal(null);

                  navigate(
                    `/app/predictive?trackId=${encodeURIComponent(trackId)}`
                  );

                }}
                className="px-4 py-1.5 bg-[#20D58A] text-[#07141F] font-bold text-xs rounded-lg hover:bg-[#20D58A]/90"
              >
                Simulate Trajectory
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );
};