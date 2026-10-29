'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { useLoginUserMutation } from '@/store/Auth/authApi';
import { setCredentials } from '@/store/Auth/authSlice';
import { useAppDispatch } from '@/store/store';

const API_ROOT = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

function GateStaffLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const [identifier, setIdentifier] = React.useState(searchParams.get('email') || '');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = identifier.trim();
    if (!email.includes('@')) {
      toast.error('Use the email address from your invitation.');
      return;
    }
    try {
      const response = await loginUser({ email, password }).unwrap();
      const user = response.data.user;
      if (user?.role !== 'GATE') {
        toast.error('This sign-in is for gate staff.');
        return;
      }
      dispatch(
        setCredentials({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          user,
        }),
      );
      const inviteToken = searchParams.get('token') || '';
      if (inviteToken) {
        await fetch(`${API_ROOT}/individual/gate/invitation/accept`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: inviteToken }),
        });
      }
      window.location.assign('/gate-staff');
    } catch (error: unknown) {
      const apiError = error as { data?: { message?: string }; message?: string };
      toast.error(apiError.data?.message || apiError.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F0EDE6] sm:py-6 flex justify-center items-start">
      <div className="w-full max-w-[430px] min-h-screen sm:min-h-[880px] bg-[#FBFAF6] sm:rounded-[36px] sm:shadow-2xl flex flex-col p-6 sm:border sm:border-[#E8E4DC]">
        <div className="flex items-center gap-2.5 mb-7 pt-1">
          <div className="w-8 h-8 rounded-lg bg-[#7A3B18] flex items-center justify-center text-white font-serif font-bold text-base shadow-xs">
            M
          </div>
          <span className="font-serif font-semibold text-lg text-[#1F1916]">McEniesVite</span>
        </div>

        <div className="space-y-2 mb-6">
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[#1F1916]">Welcome Back</h1>
          <p className="text-sm text-[#70665F] leading-relaxed">
            Sign in to manage guest entry at your assigned event.
          </p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-[#70665F] block">Email / Phone</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-white border border-[#EAE5DC] rounded-2xl px-4 py-3.5 text-sm text-[#1F1916] placeholder:text-[#8A7E75] focus:outline-none focus:border-[#7A3B18] transition-colors shadow-2xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-normal text-[#70665F] block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full bg-white border border-[#EAE5DC] rounded-2xl px-4 py-3.5 pr-12 text-sm text-[#1F1916] placeholder:text-[#8A7E75] focus:outline-none focus:border-[#7A3B18] transition-colors shadow-2xs"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A7E75] hover:text-[#1F1916] p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-4 bg-[#7A3B18] hover:bg-[#683214] disabled:opacity-70 text-white rounded-2xl text-base font-medium transition-colors shadow-xs active:scale-[0.99] text-center"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          <div className="text-center pt-1 pb-2">
            <button
              type="button"
              onClick={() => {
                const email = identifier.includes('@') ? `?email=${encodeURIComponent(identifier.trim())}` : '';
                router.push(`/forgot-password${email}`);
              }}
              className="text-xs font-medium text-[#7A3B18] hover:underline"
            >
              Forgot Password?
            </button>
          </div>
        </form>

        <div className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3 mt-4">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[#80756C] block">FIRST TIME HERE?</span>
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

export default function GateStaffLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F0EDE6]" />}>
      <GateStaffLogin />
    </Suspense>
  );
}
