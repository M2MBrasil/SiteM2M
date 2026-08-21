import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'M2MBrasil | Produtos Personalizados Sob Medida',
  description:
    'Camisetas personalizadas, moletons, bonés trucker, canecas e uniformes corporativos. Estamparia digital e bordado em alta definição.',
  applicationName: 'M2MBrasil',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'M2MBrasil | Produtos Personalizados Sob Medida',
    description:
      'Sistema completo de personalização, catálogo e pedidos da M2MBrasil Produtos Personalizados.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#030712',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning className="bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}

