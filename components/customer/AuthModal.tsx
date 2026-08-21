'use client';

import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  FileText,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register' | 'admin';
  onSuccessNavigate?: (targetView: 'store' | 'account' | 'admin') => void;
}

export function AuthModal({
  isOpen,
  onClose,
  initialTab = 'login',
  onSuccessNavigate,
}: AuthModalProps) {
  const { login, registerCustomer, switchRoleDemo, user } = useAuth();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'admin'>(initialTab);
  const [loading, setLoading] = useState(false);

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCpfCnpj, setRegCpfCnpj] = useState('');
  const [regZipCode, setRegZipCode] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [regComplement, setRegComplement] = useState('');
  const [regNeighborhood, setRegNeighborhood] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regState, setRegState] = useState('SP');
  const [searchingCep, setSearchingCep] = useState(false);

  if (!isOpen) return null;

  // Auto-fill address via ViaCEP
  const handleCepBlur = async () => {
    const cleanCep = regZipCode.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setSearchingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setRegAddress(data.logradouro || '');
          setRegNeighborhood(data.bairro || '');
          setRegCity(data.localidade || '');
          setRegState(data.uf || 'SP');
          showToast('success', 'Endereço Localizado!', `${data.logradouro}, ${data.bairro}`);
        }
      } catch {
        // ignore
      } finally {
        setSearchingCep(false);
      }
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) {
      showToast('warning', 'Atenção', 'Informe seu e-mail cadastrado.');
      return;
    }
    setLoading(true);
    const res = await login(loginEmail, loginPassword);
    setLoading(false);

    if (res.success) {
      showToast('success', 'Bem-vindo(a)!', 'Login realizado com sucesso.');
      onClose();
      if (onSuccessNavigate) {
        onSuccessNavigate(res.role === 'admin' ? 'admin' : 'account');
      }
    } else {
      showToast('error', 'Falha no Acesso', res.error || 'Verifique seus dados e tente novamente.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPhone) {
      showToast('warning', 'Campos Obrigatórios', 'Preencha Nome, WhatsApp e E-mail.');
      return;
    }
    setLoading(true);
    const res = await registerCustomer({
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword || '123456',
      cpfCnpj: regCpfCnpj,
      zipCode: regZipCode,
      address: regAddress,
      number: regNumber,
      neighborhood: regNeighborhood,
      city: regCity,
      state: regState,
    });
    setLoading(false);

    if (res.success) {
      showToast('success', 'Conta Criada!', 'Seu cadastro foi concluído com sucesso.');
      onClose();
      if (onSuccessNavigate) {
        onSuccessNavigate('account');
      }
    } else {
      showToast('error', 'Não foi possível cadastrar', res.error || 'Tente novamente.');
    }
  };

  const handleQuickCustomerDemo = () => {
    switchRoleDemo('customer');
    showToast('success', 'Cliente Conectado!', 'Sessão iniciada como cliente Carlos Eduardo.');
    onClose();
    if (onSuccessNavigate) onSuccessNavigate('account');
  };

  const handleQuickAdminDemo = () => {
    switchRoleDemo('admin');
    showToast('success', 'Administrador Conectado!', 'Acesso liberado a todos os módulos e CRUDs.');
    onClose();
    if (onSuccessNavigate) onSuccessNavigate('admin');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border border-blue-800/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center mx-auto shadow-lg shadow-blue-900/40 text-white font-black text-xl border border-blue-400/40">
            M2M
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {activeTab === 'login' && 'Entrar na Minha Conta'}
            {activeTab === 'register' && 'Criar Conta de Cliente'}
            {activeTab === 'admin' && 'Painel do Administrador'}
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {activeTab === 'login' && 'Acompanhe seus pedidos, orçamentos e personalize seus produtos.'}
            {activeTab === 'register' && 'Cadastre-se em segundos para fazer pedidos e salvar seus endereços.'}
            {activeTab === 'admin' && 'Acesso restrito para gestão de catálogo, estoque, pedidos e clientes.'}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'login'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Entrar (Login)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'register'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Criar Cadastro
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'admin'
                ? 'bg-indigo-700 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Admin / Gestão
          </button>
        </div>

        {/* TAB 1: LOGIN */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">E-mail Cadastrado</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="seuemail@exemplo.com.br"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Senha de Acesso</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Sua senha"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 transition-all"
            >
              <User className="w-4 h-4" />
              <span>{loading ? 'Entrando...' : 'Acessar Minha Conta'}</span>
            </button>

            {/* Quick 1-click test button */}
            <div className="pt-3 border-t border-slate-800 text-center space-y-2">
              <p className="text-[11px] text-slate-400">Ambiente de Demonstração:</p>
              <button
                type="button"
                onClick={handleQuickCustomerDemo}
                className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-blue-300 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>Entrar Rápido com Perfil de Cliente Demo</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: REGISTER */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Nome Completo / Empresa *</label>
              <input
                type="text"
                required
                placeholder="Ex: João da Silva ou Silva Construtora"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">WhatsApp Oficial com DDD *</label>
                <input
                  type="text"
                  required
                  placeholder="(15) 99999-9999"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">E-mail *</label>
                <input
                  type="email"
                  required
                  placeholder="seuemail@exemplo.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">CPF ou CNPJ (Opcional)</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={regCpfCnpj}
                  onChange={(e) => setRegCpfCnpj(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Senha para Acessar</label>
                <input
                  type="password"
                  placeholder="Crie uma senha"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Address fields */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-blue-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Endereço de Entrega (Preenchimento Rápido via CEP)
                </span>
                {searchingCep && <span className="text-[10px] text-yellow-400">Buscando CEP...</span>}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1 space-y-1">
                  <input
                    type="text"
                    placeholder="CEP: 00000-000"
                    value={regZipCode}
                    onChange={(e) => setRegZipCode(e.target.value)}
                    onBlur={handleCepBlur}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <input
                    type="text"
                    placeholder="Rua / Avenida"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Nº"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs"
                />
                <input
                  type="text"
                  placeholder="Bairro"
                  value={regNeighborhood}
                  onChange={(e) => setRegNeighborhood(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs"
                />
                <input
                  type="text"
                  placeholder="Cidade/UF"
                  value={`${regCity ? `${regCity}/${regState}` : ''}`}
                  onChange={(e) => setRegCity(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Salvando Cadastro...' : 'Concluir Cadastro e Acessar Loja'}</span>
            </button>
          </form>
        )}

        {/* TAB 3: ADMIN ACCESS */}
        {activeTab === 'admin' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Área Restrita da Diretoria & Produção</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Aqui você gerencia todos os <strong>Produtos</strong> (CRUD completo), <strong>Estoque</strong>,{' '}
                <strong>Clientes cadastrados</strong>, <strong>Pedidos</strong>, <strong>Orçamentos</strong>,{' '}
                <strong>Cores & Tamanhos</strong>, <strong>Cupons de Desconto</strong> e <strong>Configurações do WhatsApp da Empresa</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={handleQuickAdminDemo}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-xs shadow-xl shadow-indigo-950/70 flex items-center justify-center gap-2 transition-all border border-indigo-400/40"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Abrir Painel de Gestão Completa (Modo Admin)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center">
              <p className="text-[11px] text-slate-400">
                Credencial padrão: <strong className="text-slate-200">admin@m2mbrasil.com.br</strong> • Senha:{' '}
                <strong className="text-slate-200">admin123</strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
