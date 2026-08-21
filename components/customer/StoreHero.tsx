'use client';

import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Shirt, Layers, Coffee, Briefcase, Tag, MessageCircle } from 'lucide-react';
import { getCompanySettings } from '@/lib/storage';
import { buildWhatsAppLink } from '@/lib/formatters';

interface StoreHeroProps {
  onExploreCatalog: () => void;
  onSelectCategory: (categoryId: string) => void;
}

export function StoreHero({ onExploreCatalog, onSelectCategory }: StoreHeroProps) {
  const settings = getCompanySettings();

  const handleWhatsApp = () => {
    const link = buildWhatsAppLink(
      settings.whatsapp,
      'Olá, M2MBrasil! Gostaria de um orçamento personalizado para a minha empresa/equipe.'
    );
    window.open(link, '_blank');
  };

  const quickCategories = [
    { id: 'cat-camisetas', label: 'Camisetas Dry Fit', icon: Shirt, tag: 'Mais Vendido' },
    { id: 'cat-moletons', label: 'Moletons Flanelados', icon: Layers, tag: 'Inverno' },
    { id: 'cat-bones', label: 'Bonés Trucker', icon: Sparkles, tag: 'Em Alta' },
    { id: 'cat-canecas', label: 'Canecas Resinadas', icon: Coffee, tag: 'Brindes' },
    { id: 'cat-uniformes', label: 'Uniformes Corporativos', icon: Briefcase, tag: 'Empresas' },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-blue-950/70 to-slate-950 text-white border-b border-blue-900/40 py-12 sm:py-16 lg:py-20">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-blue-600/15 via-indigo-500/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/40 border border-blue-500/40 text-blue-200 text-xs font-bold shadow-lg shadow-blue-950/50 backdrop-blur-md">
            {settings.logoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={settings.logoUrl}
                alt="Logo"
                className="w-4 h-4 object-contain rounded"
              />
            ) : (
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            )}
            <span>{(settings.companyName || 'M2MBrasil').toUpperCase()} • PRODUTOS PERSONALIZADOS SOB MEDIDA</span>
          </div>

          {/* Main Title with Blue/Silver Metallic Text */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
            Sua Marca em Destaque com{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-100 to-indigo-300">
              Produtos Exclusivos
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto">
            Camisetas Dry Fit UV50+, moletons, bonés trucker, canecas fotográficas e uniformes empresariais com estampa e bordado de alta definição.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              id="hero-explore-catalog-btn"
              onClick={onExploreCatalog}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-blue-900/50 flex items-center justify-center gap-2.5 transition-all hover:scale-105 border border-blue-400/40"
            >
              <span>Ver Catálogo de Produtos</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-whatsapp-btn"
              onClick={handleWhatsApp}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 font-bold text-sm shadow-lg flex items-center justify-center gap-2.5 transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Orçamento via WhatsApp</span>
            </button>
          </div>

          {/* Quick Category Chips */}
          <div className="pt-8">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
              Explore por categoria principal:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {quickCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                    className="group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-blue-900/30 border border-slate-800 hover:border-blue-500/50 text-xs font-semibold text-slate-200 transition-all hover:-translate-y-0.5 shadow-sm"
                  >
                    <Icon className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span>{cat.label}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/40">
                      {cat.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Metrics Strip */}
        <div className="mt-14 pt-8 border-t border-blue-900/30 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <p className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-white">
              +15.000
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Peças Personalizadas</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <p className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-white">
              100%
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Aprovação de Arte Prévia</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <p className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-white">
              +850
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Empresas & Clientes</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <p className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-white">
              5.0 ★
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Avaliação em Qualidade</p>
          </div>
        </div>
      </div>
    </section>
  );
}
