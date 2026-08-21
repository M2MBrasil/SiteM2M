'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  User as UserIcon,
  Search,
  Menu,
  X,
  Shield,
  LogOut,
  Sparkles,
  PhoneCall,
  ChevronDown,
  Layers,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { getCompanySettings } from '@/lib/storage';
import { buildWhatsAppLink } from '@/lib/formatters';

interface HeaderProps {
  currentView: 'store' | 'checkout' | 'account' | 'admin' | string;
  setCurrentView: (view: 'store' | 'checkout' | 'account' | 'admin') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory?: string | null;
  setSelectedCategory?: (category: string | null) => void;
  onRequestQuote?: () => void;
  onOpenLogin?: (initialTab?: 'login' | 'register' | 'admin') => void;
  onOpenQuoteModal?: () => void;
}

export function Header({
  currentView,
  setCurrentView,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onRequestQuote,
  onOpenLogin,
  onOpenQuoteModal,
}: HeaderProps) {
  const { user, isAdmin, isCustomer, logout } = useAuth();
  const { itemCount, setIsCartDrawerOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const settings = getCompanySettings();

  const handleWhatsAppContact = () => {
    const link = buildWhatsAppLink(
      settings.whatsapp,
      'Olá, M2MBrasil! Gostaria de falar com o atendimento sobre produtos personalizados.'
    );
    window.open(link, '_blank');
  };

  const handleAdminButtonClick = () => {
    if (isAdmin) {
      setCurrentView('admin');
    } else {
      if (onOpenLogin) {
        onOpenLogin('admin');
      } else {
        setCurrentView('admin');
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-gradient-to-r from-slate-950 via-blue-950/95 to-slate-950 backdrop-blur-md border-b border-blue-800/40 text-slate-100 shadow-xl">
      {/* Top micro announcement bar */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-xs py-1.5 px-4 text-center text-blue-100 border-b border-blue-700/30 flex items-center justify-between">
        <div className="hidden sm:flex items-center gap-2 text-slate-200">
          <Sparkles className="w-3.5 h-3.5 text-blue-300 animate-pulse" />
          <span>M2M Brasil • Personalizados de Alta Qualidade • Sublimação, Silk, Bordados e DTF</span>
        </div>
        <div className="mx-auto sm:mx-0 flex items-center gap-4 text-xs">
          <span className="text-slate-300">
            WhatsApp da Empresa:{' '}
            <a
              href="https://wa.me/5515996019227"
              target="_blank"
              rel="noreferrer"
              className="text-blue-300 font-bold hover:underline"
            >
              (15) 99601-9227
            </a>
          </span>
          {settings.freeShippingEnabled && (
            <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/40 font-medium">
              Frete Grátis acima de R$ {settings.minOrderValueForFreeShipping?.toFixed(2)}
            </span>
          )}
        </div>
        <div className="hidden lg:flex items-center gap-2">
          {isAdmin ? (
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40 text-[11px] font-bold flex items-center gap-1">
              <Shield className="w-3 h-3 text-blue-300" />
              <span>Admin Conectado: MauricioM2M</span>
            </span>
          ) : isCustomer ? (
            <span className="px-2.5 py-0.5 rounded-full bg-blue-600/20 text-blue-200 border border-blue-500/30 text-[11px] font-medium">
              Cliente: {user?.name.split(' ')[0]}
            </span>
          ) : (
            <button
              onClick={() => onOpenLogin && onOpenLogin('login')}
              className="text-[11px] text-blue-300 hover:text-white font-medium underline underline-offset-2"
            >
              Área do Cliente (Entrar / Cadastrar)
            </button>
          )}
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo */}
          <div
            id="brand-logo-button"
            onClick={() => {
              setCurrentView('store');
              if (setSelectedCategory) setSelectedCategory(null);
            }}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            {settings.logoUrl ? (
              <div className="relative h-12 max-w-[160px] flex items-center justify-center p-1 rounded-xl bg-slate-900/80 border border-blue-800/50 shadow-md group-hover:border-blue-400/60 transition-all overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={settings.logoUrl}
                  alt={settings.companyName || 'Logotipo da Empresa'}
                  className="max-h-10 max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-800 p-0.5 shadow-lg shadow-blue-950/60 group-hover:scale-105 transition-transform flex items-center justify-center border border-blue-400/40">
                <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center font-black text-2xl text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-200 to-blue-400">
                  M2M
                </div>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-white group-hover:text-blue-300 transition-colors">
                  {settings.companyName || 'M2MBrasil'}
                </span>
                <span className="text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm">
                  Personalizados
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Camisetas • Bonés • Canecas • Uniformes Corporativos</p>
            </div>
          </div>

          {/* Search bar (desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-2">
            <div className="relative w-full">
              <input
                id="header-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar camisetas, moletons, canecas, bonés..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-blue-800/50 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-blue-400 absolute left-3.5 top-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Navigation Links and Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct Admin Control Panel Button (Protected with MauricioM2M password) */}
            <button
              id="header-admin-portal-button"
              onClick={handleAdminButtonClick}
              className={`flex items-center gap-2 text-xs font-black px-4 py-2.5 rounded-xl border transition-all shadow-lg ${
                currentView === 'admin' && isAdmin
                  ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white border-blue-300 shadow-blue-900/60 scale-105'
                  : 'bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-blue-700/60 text-blue-200 hover:text-white hover:border-blue-400 hover:bg-blue-900/50'
              }`}
              title="Acesso exclusivo do Administrador MauricioM2M (CRUD de Produtos, Clientes e Pedidos)"
            >
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">
                {isAdmin ? 'Painel Admin (Mauricio)' : 'Painel Admin (Restrito 🔒)'}
              </span>
              <span className="sm:hidden">Admin</span>
            </button>

            {/* Direct WhatsApp quote button */}
            <button
              id="header-quote-button"
              onClick={onRequestQuote || onOpenQuoteModal}
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-slate-900 to-blue-950 border border-blue-700/60 text-blue-200 hover:text-white hover:border-blue-400 transition-all shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Pedir Orçamento</span>
            </button>

            {/* Shopping Cart Drawer Trigger */}
            <button
              id="header-cart-button"
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative flex items-center justify-center p-2.5 rounded-xl bg-slate-900/90 border border-blue-800/50 text-slate-200 hover:text-white hover:border-blue-400 hover:bg-slate-850 transition-all shadow-sm"
              aria-label="Abrir Carrinho"
            >
              <ShoppingBag className="w-5 h-5 text-blue-400" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-950 shadow-md">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            {/* User Account / Login */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    id="header-user-menu-button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-900/90 border border-blue-800/50 hover:border-blue-400 text-xs text-slate-200 transition-all shadow-sm"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:inline font-semibold max-w-[110px] truncate text-slate-200">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-60 bg-gradient-to-b from-slate-900 to-blue-950 border border-blue-700/60 rounded-2xl shadow-2xl p-2 z-50 divide-y divide-slate-800 text-xs animate-in fade-in"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="p-2.5">
                        <p className="font-bold text-white truncate">{user.name}</p>
                        <p className="text-slate-400 truncate text-[11px]">{user.email}</p>
                        <span className={`inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          isAdmin
                            ? 'bg-blue-600/30 text-blue-200 border-blue-400/50'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }`}>
                          {isAdmin ? 'Administrador Autorizado' : 'Cliente'}
                        </span>
                      </div>

                      <div className="py-1.5 space-y-1">
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setCurrentView('admin');
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-600/30 text-blue-200 font-semibold flex items-center gap-2"
                          >
                            <Shield className="w-4 h-4 text-blue-400" />
                            <span>Painel de Gestão (Admin)</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setCurrentView('account');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 flex items-center gap-2"
                        >
                          <UserIcon className="w-4 h-4 text-blue-400" />
                          <span>{isAdmin ? 'Meus Dados' : 'Meus Orçamentos & Pedidos'}</span>
                        </button>
                      </div>

                      <div className="pt-1.5">
                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                            setCurrentView('store');
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-950/40 text-rose-300 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4 text-rose-400" />
                          <span>Sair da Conta</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  id="header-login-button"
                  onClick={() => {
                    if (onOpenLogin) onOpenLogin('login');
                    else setCurrentView('account');
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-900/40 transition-all border border-blue-400/40 hover:scale-[1.02]"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Entrar / Cadastrar</span>
                </button>
              )}
            </div>

            {/* Mobile menu hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-slate-900 border border-blue-800/50 text-slate-300 hover:text-white"
              aria-label="Abrir Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Global Primary Navigation Strip (3 Main Portals) */}
        <div className="pb-3 pt-1.5 flex items-center justify-between border-t border-blue-900/30 gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2">
            {/* Tab 1: Loja */}
            <button
              id="nav-tab-store"
              onClick={() => {
                setCurrentView('store');
                if (setSelectedCategory) setSelectedCategory(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                currentView === 'store'
                  ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-900/50 border border-blue-400/50'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-850 border border-blue-950'
              }`}
            >
              <Layers className="w-4 h-4 text-blue-300" />
              <span>1. Loja & Catálogo de Produtos</span>
            </button>

            {/* Tab 2: Área do Cliente */}
            <button
              id="nav-tab-account"
              onClick={() => {
                if (!user && onOpenLogin) {
                  onOpenLogin('login');
                } else {
                  setCurrentView('account');
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                currentView === 'account'
                  ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-900/50 border border-blue-400/50'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-850 border border-blue-950'
              }`}
            >
              <UserIcon className="w-4 h-4 text-blue-300" />
              <span>2. Área do Cliente {user ? `(${user.name.split(' ')[0]})` : '(Orçamentos & Pedidos)'}</span>
            </button>

            {/* Tab 3: Painel Admin (Restrito ao MauricioM2M) */}
            <button
              id="nav-tab-admin"
              onClick={handleAdminButtonClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                currentView === 'admin' && isAdmin
                  ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-700 text-white shadow-lg shadow-blue-950 border border-blue-300'
                  : 'bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-blue-200 hover:text-white hover:bg-blue-900/50 border border-blue-700/60'
              }`}
            >
              <Shield className="w-4 h-4 text-blue-400" />
              <span>3. Painel do Administrador (MauricioM2M)</span>
              <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded ${
                isAdmin ? 'bg-blue-500/30 text-blue-200' : 'bg-blue-900/50 text-blue-300'
              }`}>
                {isAdmin ? 'Ativo' : 'Restrito 🔒'}
              </span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-300">
            <span>WhatsApp Vendas:</span>
            <a
              href="https://wa.me/5515996019227"
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 font-bold hover:underline"
            >
              (15) 99601-9227
            </a>
          </div>
        </div>

        {/* Mobile Search & Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-blue-900/40 space-y-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar produtos..."
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-blue-800/50 rounded-xl text-sm text-slate-100 placeholder-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <button
                onClick={() => {
                  setCurrentView('store');
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-bold text-left flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>1. Catálogo Loja</span>
              </button>
              <button
                onClick={() => {
                  if (!user && onOpenLogin) onOpenLogin('login');
                  else setCurrentView('account');
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-blue-300 font-bold text-left flex items-center gap-1.5"
              >
                <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                <span>2. Área do Cliente</span>
              </button>
              <button
                onClick={() => {
                  handleAdminButtonClick();
                  setMobileMenuOpen(false);
                }}
                className="col-span-2 p-2.5 rounded-xl bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 border border-blue-600/60 text-blue-200 font-black text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>3. Painel do Administrador (MauricioM2M)</span>
                </div>
                <span className="text-[10px] uppercase font-bold bg-blue-600 px-2 py-0.5 rounded text-white">
                  {isAdmin ? 'Abrir' : 'Login 🔒'}
                </span>
              </button>
              <button
                onClick={() => {
                  if (onRequestQuote) onRequestQuote();
                  else if (onOpenQuoteModal) onOpenQuoteModal();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-slate-900 border border-blue-900/50 text-slate-200 font-medium text-left"
              >
                Pedir Orçamento
              </button>
              <button
                onClick={() => {
                  handleWhatsAppContact();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-700/40 text-blue-300 font-medium text-left flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
                <span>WhatsApp (15) 99601-9227</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
