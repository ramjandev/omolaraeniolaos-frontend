'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

export default function GateStaffLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/gate-staff');
  };

  return (
    <div className="min-h-screen bg-[#F0EDE6] sm:py-6 flex justify-center items-start">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-[430px] min-h-screen sm:min-h-[880px] bg-[#FBFAF6] sm:rounded-[36px] sm:shadow-2xl flex flex-col p-6 sm:border sm:border-[#E8E4DC]">
        
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 mb-7 pt-1">
          <div className="w-8 h-8 rounded-lg bg-[#7A3B18] flex items-center justify-center text-white font-serif font-bold text-base shadow-xs">
            M
          </div>
          <span className="font-serif font-semibold text-lg text-[#1F1916]">
            McEniesVite
          </span>
        </div>

        {/* Welcome Back & Subtitle */}
        <div className="space-y-2 mb-6">
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[#1F1916]">
            Welcome Back
          </h1>
          <p className="text-sm text-[#70665F] leading-relaxed">
            Sign in to manage guest entry at your assigned event.
          </p>
        </div>

        {/* Authentication Form matching 02 · Staff login.png */}
        <form onSubmit={handleSignIn} className="space-y-4">
          {/* Email / Phone input */}
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-[#70665F] block">
              Email / Phone
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-white border border-[#EAE5DC] rounded-2xl px-4 py-3.5 text-sm text-[#1F1916] placeholder:text-[#8A7E75] focus:outline-none focus:border-[#7A3B18] transition-colors shadow-2xs"
            />
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-[#70665F] block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full bg-white border border-[#EAE5DC] rounded-2xl px-4 py-3.5 text-sm text-[#1F1916] placeholder:text-[#8A7E75] focus:outline-none focus:border-[#7A3B18] transition-colors shadow-2xs"
            />
          </div>

          {/* Sign In CTA button (Brown) */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 px-4 bg-[#7A3B18] hover:bg-[#683214] text-white rounded-2xl text-base font-medium transition-colors shadow-xs active:scale-[0.99] text-center"
            >
              Sign In
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="text-center pt-1 pb-2">
            <button
              type="button"
              onClick={() => alert('Password reset instructions will be sent to your registered email.')}
              className="text-xs font-medium text-[#7A3B18] hover:underline"
            >
              Forgot Password?
            </button>
          </div>
        </form>

        {/* FIRST TIME HERE? Card matching mockup 02 */}
        <div className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3 mt-4">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[#80756C] block">
            FIRST TIME HERE?
          </span>

          <p className="text-xs font-semibold text-[#1F1916] leading-snug">
            Use the secure link in your invitation email to set up access.
          </p>

          <button
            type="button"
            onClick={() => router.push('/gate-staff/invite')}
            className="w-full py-3.5 px-4 bg-[#211612] hover:bg-[#34241D] text-white rounded-2xl text-sm font-medium transition-colors shadow-xs active:scale-[0.99] text-center"
          >
            Use Invitation Link
          </button>
        </div>

      </div>
    </div>
  );
}
