import * as React from 'react';
import { UniversalSignUp } from '@/components/auth/UniversalSignUp';

export const metadata = {
  title: 'Sign Up | McEniesFête Events',
  description: 'Create your McEniesVite account to manage events, guests, invitations, and event-day experience.',
};

export default function SignUpPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-[#FAF9F6]">
          <div className="w-8 h-8 rounded-full border-2 border-[#703816] border-t-transparent animate-spin" />
        </div>
      }
    >
      <UniversalSignUp />
    </React.Suspense>
  );
}
