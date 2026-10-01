import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Play,
  Shield,
  Eye,
  BrainCircuit,
  Compass,
  Trees,
  CheckCircle2,
  Users,
  AlertTriangle,
  X,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import heroImg from '../assets/images/hero_wildlife_coexistence_1790851254764.jpg';
import leopardCam from '../assets/images/wildlife_leopard_cam_1790851270060.jpg';
import elephantCam from '../assets/images/wildlife_elephant_monitoring_1790851283765.jpg';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#07141F] text-slate-100 flex flex-col font-sans selection:bg-[#20D58A]/30 selection:text-[#20D58A]">
      {/* 1. Top Navigation Bar (Strict Top Bar Contract) */}
      <header className="h-20 border-b border-[#193348]/80 bg-[#07141F]/90 backdrop-blur-md sticky top-0 z-50 px-6 lg:px-12 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#20D58A] to-[#19B7C9] flex items-center justify-center text-[#07141F] font-black shadow-[0_0_15px_rgba(32,213,138,0.4)]">
            VD
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-[#20D58A] transition-colors">
              VanDristi
            </span>
            <span className="text-[10px] text-slate-400 font-mono -mt-1 hidden sm:block">
              People · Wildlife · A Shared Tomorrow
            </span>
          </div>
        </Link>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
          <a href="#how-it-works" className="hover:text-[#20D58A] transition-colors">
            How It Works
          </a>
          <a href="#detection" className="hover:text-[#20D58A] transition-colors">
            AI Detection
          </a>
          <a href="#prediction" className="hover:text-[#20D58A] transition-colors">
            Predictive Intelligence
          </a>
          <a href="#ranger" className="hover:text-[#20D58A] transition-colors">
            Ranger Response
          </a>
          <a href="#habitat" className="hover:text-[#20D58A] transition-colors">
            Habitat Health
          </a>
        </nav>

        {/* Zone 3: Primary Action CTAs */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/app"
            className="px-4 py-2 bg-[#20D58A] hover:bg-[#20D58A]/90 text-[#07141F] font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <span>Launch Platform</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* 2. Hero Section (Directly replicates reference design screen 1) */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-6 lg:px-12 py-16 overflow-hidden">
        {/* Background Visual Asset */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImg}
            alt="Asian Elephant and Leopard in misty tropical forest"
            className="w-full h-full object-cover opacity-50 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07141F] via-[#07141F]/70 to-[#07141F]/40" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#07141F_80%)]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#102433]/80 border border-[#20D58A]/30 text-xs text-[#20D58A] font-medium shadow-lg backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-[#20D58A] animate-pulse" />
            <span>Autonomous Wildlife Conflict Prevention Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08] text-balance">
            Technology for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20D58A] to-[#19B7C9]">Coexistence</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed text-balance">
            AI-powered wildlife monitoring, prediction and response for a safer, balanced tomorrow.
            From optical camera detection to trajectory forecasting and rapid tactical ranger dispatch.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/app"
              className="px-6 py-3.5 bg-[#20D58A] hover:bg-[#20D58A]/90 text-[#07141F] font-bold text-sm rounded-xl shadow-xl transition-all flex items-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setDemoModalOpen(true)}
              className="px-6 py-3.5 bg-[#0B1B28]/90 hover:bg-[#102433] text-white border border-[#193348] font-semibold text-sm rounded-xl transition-all flex items-center gap-2 shadow-lg backdrop-blur-xs cursor-pointer"
            >
              <Play className="w-4 h-4 text-[#20D58A] fill-[#20D58A]" />
              <span>Watch Demo Walkthrough</span>
            </button>
          </div>

          {/* Statistics Bar (4 Stats directly from Section 20 & Image) */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-[#193348]/60 mt-12">
            <div className="p-3">
              <span className="text-3xl font-black text-white font-mono block tabular-nums">10K+</span>
              <span className="text-xs text-slate-400 font-medium mt-1 block">Animals Monitored</span>
            </div>
            <div className="p-3">
              <span className="text-3xl font-black text-[#20D58A] font-mono block tabular-nums">500+</span>
              <span className="text-xs text-slate-400 font-medium mt-1 block">Incidents Prevented</span>
            </div>
            <div className="p-3">
              <span className="text-3xl font-black text-[#19B7C9] font-mono block tabular-nums">50+</span>
              <span className="text-xs text-slate-400 font-medium mt-1 block">Ranger Teams</span>
            </div>
            <div className="p-3">
              <span className="text-3xl font-black text-amber-400 font-mono block tabular-nums">100%</span>
              <span className="text-xs text-slate-400 font-medium mt-1 block">Safer Communities</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section: Complete Operational Workflow (Section 1) */}
      <section id="how-it-works" className="py-20 px-6 lg:px-12 bg-[#0B1B28]/60 border-t border-b border-[#193348]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#20D58A]">
              Full Operational Architecture
            </span>
            <h2 className="text-3xl font-bold text-white tracking-tight">From Detection to Action</h2>
            <p className="text-xs text-slate-400">
              The continuous pipeline connecting computer vision camera traps to frontline ranger teams
            </p>
          </div>

          {/* Visual Step Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-6 relative overflow-hidden group hover:border-[#20D58A]/50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#20D58A]/10 text-[#20D58A] flex items-center justify-center font-bold text-base mb-4 border border-[#20D58A]/20">
                01
              </div>
              <h3 className="text-lg font-bold text-white">Edge Camera Detection</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Optical and thermal cameras capture wildlife in real time. YOLOv8 classifiers detect species with over 96% confidence and assign spatial bounding boxes.
              </p>
            </div>

            <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-6 relative overflow-hidden group hover:border-[#19B7C9]/50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#19B7C9]/10 text-[#19B7C9] flex items-center justify-center font-bold text-base mb-4 border border-[#19B7C9]/20">
                02
              </div>
              <h3 className="text-lg font-bold text-white">Tracking & Risk Prediction</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                ByteTrack trajectory filters compute speed and heading. LSTM spatial models project settlement entry probability and trigger geofence breach warnings.
              </p>
            </div>

            <div className="bg-[#0B1B28] border border-[#193348] rounded-xl p-6 relative overflow-hidden group hover:border-[#FF5148]/50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#FF5148]/10 text-[#FF5148] flex items-center justify-center font-bold text-base mb-4 border border-[#FF5148]/20">
                03
              </div>
              <h3 className="text-lg font-bold text-white">Tactical Ranger Mobilization</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Incidents are automatically created with evidentiary frames. Operations commanders dispatch nearest ranger squads with VHF encrypted tactical channels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section: AI Wildlife Detection Spotlight */}
      <section id="detection" className="py-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#20D58A]">
              Computer Vision
            </span>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Real-Time Wildlife Identification at the Forest Edge
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              VanDristi models run on low-power edge compute camera traps, analyzing both optical daylight feeds and nocturnal infrared thermography. 
              Our fine-tuned YOLOv8 model distinguishes leopards, elephants, wild boars, and chital deer within 40 milliseconds.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#20D58A]" />
                <span>Sub-50ms inference latency on solar-powered field camera nodes</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#20D58A]" />
                <span>Optical + Night-vision IR thermal spectrum auto-switching</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#20D58A]" />
                <span>92.4% mAP@50 benchmark across dense deciduous forest canopies</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/app/live-detection"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#20D58A] hover:underline"
              >
                <span>Experience Live Camera Feed</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-[#193348] shadow-2xl bg-[#0B1B28]">
            <img src={leopardCam} alt="Leopard Detection" className="w-full aspect-[4/3] object-cover" />
            <div className="absolute top-4 left-4 bg-[#20D58A] text-[#07141F] font-bold text-xs px-2.5 py-1 rounded shadow">
              Leopard · 96.2% Confidence
            </div>
            <div className="absolute bottom-4 right-4 bg-[#07141F]/80 text-white font-mono text-xs px-3 py-1 rounded border border-[#193348]">
              CAM-07 · 28 FPS Live
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section: Predictive Intelligence & Ranger Response */}
      <section id="prediction" className="py-20 px-6 lg:px-12 bg-[#0B1B28]/40 border-t border-[#193348]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 relative rounded-2xl overflow-hidden border border-[#193348] shadow-2xl bg-[#0B1B28]">
            <img src={elephantCam} alt="Elephant Tracking" className="w-full aspect-[4/3] object-cover" />
            <div className="absolute top-4 left-4 bg-[#F4B740] text-[#07141F] font-bold text-xs px-2.5 py-1 rounded shadow">
              TRACK-002 · Approaching Highway 12
            </div>
            <div className="absolute bottom-4 left-4 bg-[#07141F]/80 text-[#20D58A] font-mono text-xs px-3 py-1 rounded border border-[#193348]">
              Entry Risk: 67% · ETA 1 hr 10m
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#19B7C9]">
              Spatial Forecasting
            </span>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Predicting Conflicts 30 Minutes Before They Occur
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Traditional monitoring only reacts after an animal enters a human village. 
              VanDristi's spatial recurrence algorithms calculate environmental friction, water hole vectors, and historical animal corridors to forecast entry probability up to 2 hours ahead.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#19B7C9]" />
                <span>Autonomous risk scoring (0-100) combining velocity and settlement proximity</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#19B7C9]" />
                <span>Automated early alerts dispatched to village headmen and forest rangers</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#19B7C9]" />
                <span>Zero false panic alerts with calibrated confidence thresholds</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/app/predictive"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#19B7C9] hover:underline"
              >
                <span>Explore Trajectory Engine</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section: Final Platform CTA */}
      <section className="py-20 px-6 lg:px-12 text-center bg-gradient-to-b from-[#0B1B28] to-[#07141F] border-t border-[#193348]">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to deploy wildlife intelligence in your reserve?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Experience the complete Phase 1 VanDristi web application. Manage live camera traps, track wildlife coordinates, assess threats, and coordinate responder teams.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/app"
              className="px-8 py-3.5 bg-[#20D58A] hover:bg-[#20D58A]/90 text-[#07141F] font-bold text-sm rounded-xl shadow-xl transition-all"
            >
              Enter Operations Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="py-8 px-6 lg:px-12 border-t border-[#193348] text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="font-bold text-white">VanDristi</span>
          <span>·</span>
          <span>Autonomous Wildlife Coexistence Architecture</span>
        </div>
        <div>© 2025 VanDristi Conservation Initiative. All rights reserved.</div>
      </footer>

      {/* Interactive Demo Video Modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="bg-[#0B1B28] border border-[#193348] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#193348]">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-[#20D58A]" />
                <h3 className="font-bold text-white text-sm">VanDristi Operational Walkthrough</h3>
              </div>
              <button
                onClick={() => setDemoModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video rounded-xl overflow-hidden border border-[#193348] bg-black">
              <img src={heroImg} alt="Demo Video Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-14 h-14 rounded-full bg-[#20D58A] text-[#07141F] flex items-center justify-center font-black shadow-lg">
                  <Play className="w-6 h-6 fill-[#07141F] ml-1" />
                </div>
                <div className="font-bold text-white text-base">VanDristi Phase 1 Operational Demo</div>
                <p className="text-xs text-slate-300 max-w-md">
                  Demonstrating the full loop: CAM-07 IR leopard detection → ByteTrack trajectory fix → Village X threat calculation → Ranger Team 3 tactical assignment.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDemoModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setDemoModalOpen(false);
                  navigate('/app');
                }}
                className="px-5 py-2 bg-[#20D58A] text-[#07141F] font-bold text-xs rounded-xl"
              >
                Open Live Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
