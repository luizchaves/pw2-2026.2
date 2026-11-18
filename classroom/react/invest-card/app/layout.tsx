import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
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
      {/* A casca de cada área (navbar e margens) vem do layout do seu grupo:
          `(admin)` para quem entrou, `(public)` para quem ainda não. */}
      <body className="bg-slate-100 min-h-screen">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
