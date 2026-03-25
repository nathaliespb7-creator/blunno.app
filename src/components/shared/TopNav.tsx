'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const TopNav = ({ title }: { title: string }) => {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-20 border-b border-white/10 bg-[#120a2d]/60 backdrop-blur-md">
      <div className="mx-auto flex h-12 w-full max-w-md items-center justify-between px-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:text-white hover:border-white/20 transition-colors"
        >
          Back
        </button>

        <div className="text-sm font-medium text-white/90">{title}</div>

        <Link
          href="/choose"
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:text-white hover:border-white/20 transition-colors"
        >
          Home
        </Link>
      </div>
    </div>
  );
};

