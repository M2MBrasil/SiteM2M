'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Instagram,
  Facebook,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { getCompanySettings, subscribeDb } from '@/lib/storage';
import { buildWhatsAppLink } from '@/lib/formatters';

interface FooterProps {
  onOpenLogin?: () => void;
  setCurrentView?: (view: any) => void;
  onNavigate?: (view: any) => void;
  onRequestQuote?: () => void;
}

export function Footer({ onOpenLogin, setCurrentView, onNavigate, onRequestQuote }: FooterProps) {
  const [settings, setSettings] = useState(() => getCompanySettings());

  useEffect(() => {
    return subscribeDb(() => setSettings(getCompanySettings()));
  }, []);

  const handleNavigate = (view: string) => {
    if (onNavigate) onNavigate(view);
    else if (setCurrentView) setCurrentView(view);
  };

  const handleWhatsApp = () => {
    const link = buildWhatsAppLink(settings.whatsapp, settings.whatsappDefaultMessage);
    window.open(link, '_blank');
  };

  const hasAddress = !!(settings.address && settings.address.trim());
  const hasPhone = !!(settings.phone && settings.phone.trim());
  const hasEmail = !!(settings.email && settings.email.trim());
  const hasCnpj = !!(settings.cnpj && settings.cnpj.trim());

  return (
    <footer className="w-full bg-slate-950 border-t border-blue-900/40 text-slate-300">
      {/* Highlights / Trust Badges with Blue Gradient */}
      <div className="border-b border-blue-900/30 bg-gradient-to-r from-blue-950/60 via-slate-900/90 to-blue-950/60 py-8 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-900/70 border border-blue-800/30 shadow-lg shadow-blue-950/40">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shrink-0 border border-blue-400/40 shadow-md">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-white">Entrega para Todo o Brasil</p>
              <p className="text-xs text-slate-400">Envio expresso e rastreado</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-900/70 border border-blue-800/30 shadow-lg shadow-blue-950/40">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shrink-0 border border-blue-400/40 shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-white">Alta Durabilidade</p>
              <p className="text-xs text-slate-400">Sublimação, Silk e DTF Premium</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-900/70 border border-blue-800/30 shadow-lg shadow-blue-950/40">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shrink-0 border border-blue-400/40 shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-white">Aprovação de Arte</p>
              <p className="text-xs text-slate-400">Visualização prévia antes de produzir</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-900/70 border border-blue-800/30 shadow-lg shadow-blue-950/40">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shrink-0 border border-blue-400/40 shadow-md">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-white">Pagamento Facilitado</p>
              <p className="text-xs text-slate-400">PIX com desconto, Cartão e Boleto</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {settings.logoUrl ? (
                <div className="h-10 max-w-[150px] flex items-center justify-center p-1 rounded-xl bg-slate-900 border border-blue-900/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={settings.logoUrl}
                    alt={settings.companyName || 'Logotipo'}
                    className="max-h-8 max-w-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-700 flex items-center justify-center text-white font-black text-lg border border-blue-300/40 shadow-lg shadow-blue-950/50">
                  M2M
                </div>
              )}
              <span className="font-black text-lg text-white">{settings.companyName || 'M2MBrasil'}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Referência em confecção e personalização de camisetas Dry Fit, moletons, bonés trucker, canecas e uniformes empresariais sob medida para seu negócio ou evento.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {settings.instagram && (
                <a
                  href={`https://instagram.com/${settings.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-pink-400 hover:border-pink-500/50 flex items-center justify-center transition-all"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.facebook && (
                <a
                  href={settings.facebook.startsWith('http') ? settings.facebook : `https://${settings.facebook}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-blue-400 hover:border-blue-500/50 flex items-center justify-center transition-all"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              <button
                onClick={handleWhatsApp}
                className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 hover:bg-emerald-900 flex items-center justify-center transition-all"
                aria-label="WhatsApp"
                title="Atendimento WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Institutional Navigation */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4 uppercase tracking-wider text-blue-300">
              Departamentos
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => handleNavigate('store')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Camisetas & Dry Fit UV50+
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('store')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Moletons Flanelados Canguru
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('store')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Bonés Trucker & Americanos
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('store')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Canecas Resinadas AAA
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('store')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Uniformes Empresariais
                </button>
              </li>
            </ul>
          </div>

          {/* Quick links & Client zone */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4 uppercase tracking-wider text-blue-300">
              Área do Cliente
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => handleNavigate('account')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Acompanhar Meu Pedido
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('account')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Minha Conta & Orçamentos
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onOpenLogin) onOpenLogin();
                    else handleNavigate('account');
                  }}
                  className="hover:text-blue-400 transition-colors"
                >
                  Cadastrar / Entrar
                </button>
              </li>
              <li>
                <button
                  onClick={handleWhatsApp}
                  className="hover:text-emerald-400 text-emerald-400/90 font-medium transition-colors flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Atendimento WhatsApp</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details - ONLY shows real data if filled in by admin */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4 uppercase tracking-wider text-blue-300">
              Atendimento & Contato
            </h4>
            <ul className="space-y-3 text-xs text-slate-400">
              {hasAddress && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>
                    {settings.address}
                    {settings.number ? `, ${settings.number}` : ''}
                    {settings.neighborhood ? ` - ${settings.neighborhood}` : ''}
                    {settings.city ? `, ${settings.city}` : ''}
                    {settings.state ? ` - ${settings.state}` : ''}
                  </span>
                </li>
              )}
              {hasPhone && (
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>{settings.phone}</span>
                </li>
              )}
              {hasEmail && (
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>{settings.email}</span>
                </li>
              )}
              {hasCnpj && (
                <li className="pt-1 text-[11px] text-slate-500">
                  CNPJ: {settings.cnpj}
                </li>
              )}
              {!hasAddress && !hasPhone && !hasEmail && !hasCnpj && (
                <li className="space-y-2">
                  <p className="text-xs text-slate-400">Entre em contato via WhatsApp oficial para suporte rápido:</p>
                  <button
                    onClick={handleWhatsApp}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-950/40"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Oficial</span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom copyright and legal line with by M2MBrasil Sistemas */}
        <div className="mt-12 pt-6 border-t border-slate-900 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <p>© 2026 {settings.companyName || 'M2MBrasil'}. Todos os direitos reservados.</p>
            <span className="hidden sm:inline text-slate-600">•</span>
            <p className="font-bold text-blue-400 bg-blue-950/60 px-2.5 py-0.5 rounded-lg border border-blue-800/40">
              by M2MBrasil Sistemas
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span>Privacidade & Termos</span>
            <span>•</span>
            <button
              onClick={() => {
                if (onOpenLogin) onOpenLogin();
                else handleNavigate('admin');
              }}
              className="text-slate-400 hover:text-blue-400 underline underline-offset-4"
            >
              Acesso Administrativo
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
