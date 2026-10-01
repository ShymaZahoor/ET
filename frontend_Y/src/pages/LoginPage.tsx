import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, ArrowRight, Lock, Mail } from 'lucide-react';
import leopardImg from '../assets/images/wildlife_leopard_cam_1790851270060.jpg';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@vandristi.org');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/app');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#07141F] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#0B1B28] border border-[#193348] rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Side: Dramatic Wildlife Aesthetic Banner (Matches Reference Screen 2) */}
        <div className="relative hidden md:flex flex-col justify-between p-8 bg-[#07141F] border-r border-[#193348] overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={leopardImg}
              alt="VanDristi Wildlife"
              className="w-full h-full object-cover opacity-60 mix-blend-luminosity scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07141F] via-[#07141F]/60 to-transparent" />
          </div>

          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#20D58A] to-[#19B7C9] flex items-center justify-center text-[#07141F] font-black shadow-md">
                VD
              </div>
              <span className="text-lg font-bold text-white tracking-tight">VanDristi</span>
            </Link>
          </div>

          <div className="relative z-10 my-auto">
            <blockquote className="text-xl font-medium text-white italic leading-snug">
              “Different species. A shared home.”
            </blockquote>
            <p className="text-xs text-slate-400 mt-2 font-light">
              Early warning & artificial intelligence for continuous human-wildlife harmony.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <span>OPERATIONS PORTAL</span>
            <span>·</span>
            <span>SECURE GATEWAY v2.4</span>
          </div>
        </div>

        {/* Right Side: Sign In Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="md:hidden flex items-center gap-2 mb-6">
              <div className="w-7 h-7 rounded-lg bg-[#20D58A] flex items-center justify-center text-[#07141F] font-bold text-xs">
                VD
              </div>
              <span className="text-lg font-bold text-white">VanDristi</span>
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
            <p className="text-xs text-slate-400 mt-1">Sign in to your VanDristi operational command account</p>

            <form onSubmit={handleSignIn} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full bg-[#07141F] border border-[#193348] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#20D58A]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] text-[#20D58A] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-[#07141F] border border-[#193348] rounded-xl pl-9 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-[#20D58A]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-[#20D58A] rounded w-4 h-4"
                />
                <label htmlFor="remember" className="ml-2 text-xs text-slate-400 select-none">
                  Remember this device for 30 days
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#20D58A] hover:bg-[#20D58A]/90 text-[#07141F] font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>{isLoading ? 'Verifying Credentials...' : 'Sign In'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Social Logins Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#193348]" />
              </div>
              <span className="relative px-3 bg-[#0B1B28] text-[10px] text-slate-500 uppercase tracking-wider">
                Or continue with
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => navigate('/app')}
                className="py-2 px-3 bg-[#07141F] hover:bg-[#102433] text-slate-300 rounded-xl text-xs font-medium border border-[#193348] transition-colors flex items-center justify-center gap-2"
              >
                <span className="font-bold">G</span>
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/app')}
                className="py-2 px-3 bg-[#07141F] hover:bg-[#102433] text-slate-300 rounded-xl text-xs font-medium border border-[#193348] transition-colors flex items-center justify-center gap-2"
              >
                <span className="font-bold text-[#19B7C9]">M</span>
                <span>Microsoft</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/app" className="text-[#20D58A] font-semibold hover:underline">
              Enter Demo Environment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
