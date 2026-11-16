import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Navbar from '@/components/Navbar';
import AppProviders from '@/contexts/AppProviders';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'InvestCard',
  description: 'Acompanhe o desempenho da sua carteira de investimentos',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-slate-100 min-h-screen">
        <AppProviders>
          <Navbar />
          <div className="p-6 md:p-10">{children}</div>
        </AppProviders>
      </body>
    </html>
  );
}
