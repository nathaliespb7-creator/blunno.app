import './globals.css';
import { Comfortaa } from 'next/font/google';

const comfortaa = Comfortaa({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-comfortaa',
  display: 'swap',
});

export const metadata = {
  title: 'Blunno',
  description: 'Your gentle companion for anxiety and ADHD',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={comfortaa.variable}>
      <body className="bg-[#FFF0F5] font-sans overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}