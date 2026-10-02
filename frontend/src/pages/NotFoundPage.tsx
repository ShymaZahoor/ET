import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Home,
  ShieldAlert,
} from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#07141F] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-2xl text-center">

        {/* Logo / Brand */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-xl bg-[#20D58A] flex items-center justify-center">
            <span className="text-[#07141F] font-black text-xl">
              VD
            </span>
          </div>

          <div className="text-left">
            <div className="text-xl font-bold tracking-wide">
              VanDristi
            </div>
            <div className="text-xs text-slate-500">
              Wildlife AI Platform
            </div>
          </div>
        </div>

        {/* Error Icon */}
        <div className="relative mx-auto mb-8 w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-[#FF5148]/10 animate-pulse" />

          <div className="relative w-24 h-24 rounded-full border border-[#FF5148]/30 bg-[#0B1B28] flex items-center justify-center">
            <ShieldAlert className="w-11 h-11 text-[#FF5148]" />
          </div>
        </div>

        {/* 404 */}
        <div className="text-8xl md:text-9xl font-black font-mono tracking-tight text-[#193348]">
          404
        </div>

        <h1 className="mt-4 text-2xl md:text-3xl font-bold">
          Page Not Found
        </h1>

        <p className="mt-4 text-sm md:text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
          The requested Vandristi module could not be found.
          The route may have been removed, moved, or entered incorrectly.
        </p>

        {/* Status */}
        <div className="mt-8 mx-auto max-w-md bg-[#0B1B28] border border-[#193348] rounded-xl p-4 text-left">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-[#F4B740]" />

            <div>
              <p className="text-sm font-semibold text-white">
                Navigation Error
              </p>

              <p className="text-xs text-slate-500 mt-1">
                Requested resource does not exist.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-[#193348] bg-[#0B1B28] hover:bg-[#102433] text-slate-300 hover:text-white text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          <Link
            to="/app"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#20D58A] hover:bg-[#20D58A]/90 text-[#07141F] text-sm font-bold transition-colors"
          >
            <Home className="w-4 h-4" />
            Return to Dashboard
          </Link>

        </div>

        {/* Footer */}
        <div className="mt-12 text-[10px] text-slate-600 font-mono">
          VANDRISTI · WILDLIFE INTELLIGENCE SYSTEM
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;