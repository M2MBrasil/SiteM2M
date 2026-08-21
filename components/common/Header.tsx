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
  onOpenLogin?: () => void;
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

  const { user, isAdmin, isCustomer, logout, switchRoleDemo } = useAuth();
  const { itemCount, setIsCartDrawerOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const settings = getCompanySettings();

  const handleWhatsAppContact = () => {
    const link = buildWhatsAppLink(
      settings.whatsapp,
      'Olá, M2MBrasil! Estou visitando a loja e gostaria de tirar uma dúvida sobre produtos personalizados.'
    );
    window.open(link, '_blank');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-blue-900/40 text-slate-100 shadow-lg">
      {/* Top micro announcement bar */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-xs py-1.5 px-4 text-center text-blue-100 border-b border-blue-800/30 flex items-center justify-between">
        <div className="hidden sm:flex items-center gap-2 text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
          <span>Especialistas em Sublimação, DTF, Silk e Bordados de Alta Precisão</span>
        </div>
        <div className="mx-auto sm:mx-0 flex items-center gap-4 text-xs">
          <span className="text-slate-300">
            WhatsApp Oficial:{' '}
            <strong className="text-blue-300">{settings.phone || '(11) 98765-4321'}</strong>
          </span>
          {settings.freeShippingEnabled && (
            <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 font-medium">
              Frete Grátis acima de R$ {settings.minOrderValueForFreeShipping?.toFixed(2)}
            </span>
          )}
        </div>
        <div className="hidden lg:flex items-center gap-2">
          {/* Fast Switcher for Demo testing */}
          <div className="relative">
            <button
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-700 hover:border-blue-500 transition-colors"
            >
              <SlidersHorizontal className="w-3 h-3 text-blue-400" />
              <span>Modo Demo: <strong>{isAdmin ? 'Admin' : isCustomer ? 'Cliente' : 'Visitante'}</strong></span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {demoMenuOpen && (
              <div
                className="absolute right-0 mt-1 w-48 bg-slate-900 border border-blue-900/60 rounded-lg shadow-xl p-1 z-50 text-xs"
                onMouseLeave={() => setDemoMenuOpen(false)}
              >
                <div className="px-2 py-1 text-slate-400 font-semibold border-b border-slate-800">
                  Alternar Perfil Rápido:
                </div>
                <button
                  onClick={() => {
                    switchRoleDemo('admin');
                    setDemoMenuOpen(false);
                    setCurrentView('admin');
                  }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-blue-600/30 text-blue-300 flex items-center justify-between"
                >
                  <span>1. Administrador</span>
                  {isAdmin && <span className="text-emerald-400">✓</span>}
                </button>
                <button
                  onClick={() => {
                    switchRoleDemo('customer');
                    setDemoMenuOpen(false);
                    setCurrentView('account');
                  }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-blue-600/30 text-slate-200 flex items-center justify-between"
                >
                  <span>2. Cliente Logado</span>
                  {isCustomer && <span className="text-emerald-400">✓</span>}
                </button>

                <button
                  onClick={() => {
                    switchRoleDemo('guest');
                    setDemoMenuOpen(false);
                    setCurrentView('store');
                  }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-blue-600/30 text-slate-400 flex items-center justify-between"
                >
                  <span>3. Visitante (Deslogado)</span>
                  {!user && <span className="text-emerald-400">✓</span>}
                </button>
              </div>
            )}
          </div>
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
              <div className="relative h-12 max-w-[160px] flex items-center justify-center p-1 rounded-xl bg-slate-900/80 border border-blue-900/50 shadow-md group-hover:border-blue-400/60 transition-all overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={settings.logoUrl}
                  alt={settings.companyName || 'Logotipo da Empresa'}
                  className="max-h-10 max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 via-blue-700 to-slate-900 p-0.5 shadow-lg shadow-blue-900/30 group-hover:scale-105 transition-transform flex items-center justify-center border border-blue-400/40">
                <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center font-black text-xl text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-200 to-blue-400">
                  M2M
                </div>
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-blue-300 transition-colors">
                  {settings.companyName || 'M2MBrasil'}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Personalizados
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Camisetas • Bonés • Canecas • Uniformes</p>
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
                placeholder="Pesquisar camisetas, moletons, canecas, bonés..."
                className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-blue-900/50 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
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
            {/* Direct Admin Control Panel Button (Always visible) */}
            <button
              id="header-admin-portal-button"
              onClick={() => {
                if (!isAdmin) {
                  switchRoleDemo('admin');
                }
                setCurrentView('admin');
              }}
              className={`flex items-center gap-2 text-xs font-black px-3.5 py-2.5 rounded-xl border transition-all shadow-lg ${
                currentView === 'admin'
                  ? 'bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white border-indigo-400 shadow-indigo-950/70 scale-105'
                  : 'bg-indigo-950/70 border-indigo-600/60 text-indigo-200 hover:bg-indigo-900 hover:border-indigo-400 hover:text-white'
              }`}
              title="Acessar o Painel de Controle Administrativo (CRUD de Produtos, Clientes, Pedidos, etc.)"
            >
              <Shield className="w-4 h-4 text-indigo-300" />
              <span className="hidden sm:inline">Painel Admin (CRUD)</span>
              <span className="sm:hidden">Admin</span>
            </button>

            {/* Direct WhatsApp quote button */}
            <button
              id="header-quote-button"
              onClick={onRequestQuote || onOpenQuoteModal}
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-900 border border-blue-700/50 text-blue-300 hover:bg-blue-900/30 hover:border-blue-500 transition-all shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Pedir Orçamento</span>
            </button>

            {/* Shopping Cart Drawer Trigger */}
            <button
              id="header-cart-button"
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative flex items-center justify-center p-2.5 rounded-xl bg-slate-900 border border-blue-900/50 text-slate-200 hover:text-white hover:border-blue-500 hover:bg-slate-850 transition-all shadow-sm"
              aria-label="Abrir Carrinho"
            >
              <ShoppingBag className="w-5 h-5 text-blue-400" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-950 shadow-md">
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
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-900 border border-blue-900/50 hover:border-blue-500 text-xs text-slate-200 transition-all"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:inline font-medium max-w-[100px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-slate-900 border border-blue-900/60 rounded-xl shadow-2xl p-2 z-50 divide-y divide-slate-800 text-xs"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="p-2">
                        <p className="font-semibold text-white truncate">{user.name}</p>
                        <p className="text-slate-400 truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {user.role === 'admin' ? 'Administrador' : 'Cliente'}
                        </span>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setCurrentView('admin');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2"
                        >
                          <Shield className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Painel Administrativo (CRUD)</span>
                        </button>
                        <button
                          onClick={() => {
                            setCurrentView('account');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2"
                        >
                          <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                          <span>Minha Conta / Meus Pedidos</span>
                        </button>
                      </div>

                      <div className="pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                            setCurrentView('store');
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-950/40 text-rose-300 flex items-center gap-2"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-400" />
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
                    if (onOpenLogin) onOpenLogin();
                    else setCurrentView('account');
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-md shadow-blue-900/30 transition-all border border-blue-400/30"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Entrar / Cadastrar</span>
                </button>
              )}
            </div>

            {/* Mobile menu hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-900 border border-blue-900/50 text-slate-300 hover:text-white"
              aria-label="Abrir Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Global Primary Navigation Strip (3 Main Portals) */}
        <div className="pb-3 pt-1 flex items-center justify-between border-t border-slate-800/80 gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2">
            {/* Tab 1: Loja */}
            <button
              id="nav-tab-store"
              onClick={() => {
                setCurrentView('store');
                if (setSelectedCategory) setSelectedCategory(null);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                currentView === 'store'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 border border-blue-400/50'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-850 border border-slate-800'
              }`}
            >
              <Layers className="w-4 h-4 text-blue-300" />
              <span>1. Loja & Catálogo</span>
            </button>

            {/* Tab 2: Área do Cliente */}
            <button
              id="nav-tab-account"
              onClick={() => {
                if (!user && onOpenLogin) {
                  onOpenLogin();
                } else {
                  setCurrentView('account');
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                currentView === 'account'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 border border-blue-400/50'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-850 border border-slate-800'
              }`}
            >
              <UserIcon className="w-4 h-4 text-cyan-300" />
              <span>2. Área do Cliente {user ? `(${user.name.split(' ')[0]})` : '(Entrar / Cadastrar)'}</span>
            </button>

            {/* Tab 3: Painel Admin (CRUD) */}
            <button
              id="nav-tab-admin"
              onClick={() => {
                if (!isAdmin) {
                  switchRoleDemo('admin');
                }
                setCurrentView('admin');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                currentView === 'admin'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-950/70 border border-indigo-400/60'
                  : 'bg-indigo-950/50 text-indigo-200 hover:text-white hover:bg-indigo-900/60 border border-indigo-800/50'
              }`}
            >
              <Shield className="w-4 h-4 text-indigo-300" />
              <span>3. Painel do Administrador (CRUD Geral)</span>
              <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200">
                Gestão
              </span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-400">
            <span>WhatsApp Vendas:</span>
            <a
              href={`https://wa.me/5515996019227`}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 font-bold hover:underline"
            >
              (15) 99601-9227
            </a>
          </div>
        </div>

        {/* Mobile Search & Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800/80 space-y-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar produtos..."
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-blue-900/50 rounded-xl text-sm text-slate-100 placeholder-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <button
                onClick={() => {
                  setCurrentView('store');
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-bold text-left flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>1. Loja Virtual</span>
              </button>
              <button
                onClick={() => {
                  setCurrentView('account');
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300 font-bold text-left flex items-center gap-1.5"
              >
                <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>2. Área do Cliente</span>
              </button>
              <button
                onClick={() => {
                  switchRoleDemo('admin');
                  setCurrentView('admin');
                  setMobileMenuOpen(false);
                }}
                className="col-span-2 p-2.5 rounded-lg bg-indigo-950/70 border border-indigo-600/50 text-indigo-200 font-black text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  <span>3. Painel do Administrador (CRUD Completo)</span>
                </div>
                <span className="text-[10px] uppercase font-bold bg-indigo-600 px-2 py-0.5 rounded text-white">Abrir</span>
              </button>
              <button
                onClick={() => {
                  if (onRequestQuote) onRequestQuote();
                  else if (onOpenQuoteModal) onOpenQuoteModal();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-lg bg-slate-900 border border-blue-900/50 text-slate-200 font-medium text-left"
              >
                Pedir Orçamento
              </button>
              <button
                onClick={() => {
                  handleWhatsAppContact();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 font-medium text-left flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                WhatsApp (15) 99601-9227
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
