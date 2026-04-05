import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Choose mode - Blunno',
  description: 'Select an activity: SOS, Planner, Play, or Relax',
};

export default function ChooseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
