import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#07141F] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0B1B28] border border-[#193348] rounded-2xl shadow-2xl p-8">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>

        <h2 className="text-xl font-bold text-white tracking-tight">Reset Password</h2>
        <p className="text-xs text-slate-400 mt-1">
          Enter your registered field operations email to receive a recovery token.
        </p>

        {submitted ? (
          <div className="mt-6 p-4 bg-[#20D58A]/10 border border-[#20D58A]/30 rounded-xl text-xs text-[#20D58A] space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Recovery Link Transmitted</span>
            </div>
            <p className="text-slate-300">
              If an account matches <b className="text-white">{email}</b>, password reset instructions have been dispatched.
            </p>
            <div className="pt-2">
              <Link to="/reset-password" className="text-[#20D58A] underline font-semibold">
                Proceed to Enter New Password →
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@vandristi.org"
                  className="w-full bg-[#07141F] border border-[#193348] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#20D58A]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#20D58A] hover:bg-[#20D58A]/90 text-[#07141F] font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
            >
              Send Reset Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
