'use client';

import React, { useState, useEffect } from 'react';
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
  KeyRound,
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
  const { login, registerCustomer, user } = useAuth();
  const { showToast } = useNotification();

  const [prevTab, setPrevTab] = useState(initialTab);
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'admin'>(initialTab);
  const [loading, setLoading] = useState(false);

  // Sync tab during render if initialTab changed
  if (initialTab !== prevTab) {
    setPrevTab(initialTab);
    setActiveTab(initialTab);
  }

  // Login Form States (Customer)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Admin Login Form States (MauricioM2M / 78645524)
  const [adminUser, setAdminUser] = useState('MauricioM2M');
  const [adminPassword, setAdminPassword] = useState('');

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

  const handleCustomerLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) {
      showToast('warning', 'Atenção', 'Informe seu e-mail cadastrado.');
      return;
    }
    setLoading(true);
    const res = await login(loginEmail, loginPassword);
    setLoading(false);

    if (res.success) {
      showToast('success', 'Bem-vindo(a)!', 'Login de cliente realizado com sucesso.');
      onClose();
      if (onSuccessNavigate) {
        onSuccessNavigate(res.role === 'admin' ? 'admin' : 'account');
      }
    } else {
      showToast('error', 'Falha no Acesso', res.error || 'Verifique seu e-mail e senha.');
    }
  };

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUser.trim() || !adminPassword) {
      showToast('warning', 'Credenciais Requeridas', 'Informe o usuário e senha do Administrador.');
      return;
    }
    setLoading(true);
    const res = await login(adminUser, adminPassword);
    setLoading(false);

    if (res.success && res.role === 'admin') {
      showToast('success', 'Acesso Autorizado!', 'Bem-vindo, Administrador MauricioM2M.');
      onClose();
      if (onSuccessNavigate) {
        onSuccessNavigate('admin');
      }
    } else {
      showToast(
        'error',
        'Acesso Negado',
        res.error || 'Somente o administrador autorizado (MauricioM2M) tem acesso a este painel.'
      );
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
      showToast('success', 'Conta Criada!', 'Seu cadastro de cliente foi concluído com sucesso.');
      onClose();
      if (onSuccessNavigate) {
        onSuccessNavigate('account');
      }
    } else {
      showToast('error', 'Não foi possível cadastrar', res.error || 'Tente novamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-blue-950/50 to-slate-900 border border-blue-600/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 space-y-6 max-h-[92vh] overflow-y-auto">
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
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-700 flex items-center justify-center mx-auto shadow-xl shadow-blue-900/50 text-white font-black text-2xl border border-blue-300/40">
            M2M
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {activeTab === 'login' && 'Entrar na Conta de Cliente'}
            {activeTab === 'register' && 'Cadastrar Novo Cliente'}
            {activeTab === 'admin' && 'Acesso Exclusivo Admin (MauricioM2M)'}
          </h2>
          <p className="text-xs text-slate-300 max-w-xs mx-auto">
            {activeTab === 'login' && 'Acompanhe seus orçamentos solicitados e veja o catálogo de produtos.'}
            {activeTab === 'register' && 'Cadastre-se para solicitar orçamentos e simular produtos personalizados.'}
            {activeTab === 'admin' && 'Painel restrito para inclusão de produtos, gestão de clientes e orçamentos.'}
          </p>
        </div>

        {/* Tab Selector with Blue Gradient theme */}
        <div className="grid grid-cols-3 gap-1 p-1.5 bg-slate-950/90 rounded-2xl border border-blue-900/50 text-xs font-bold shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`py-2.5 rounded-xl transition-all ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cliente (Entrar)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`py-2.5 rounded-xl transition-all ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Novo Cliente
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white shadow-lg shadow-blue-950 border border-blue-400/40'
                : 'text-blue-300 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin (Mauricio)</span>
          </button>
        </div>

        {/* TAB 1: CLIENT LOGIN */}
        {activeTab === 'login' && (
          <form onSubmit={handleCustomerLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">E-mail Cadastrado</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="seuemail@exemplo.com.br"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-blue-900/40 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Senha de Acesso</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Sua senha"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-blue-900/40 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <User className="w-4 h-4" />
              <span>{loading ? 'Acessando...' : 'Entrar na Área do Cliente'}</span>
            </button>
          </form>
        )}

        {/* TAB 2: CLIENT REGISTER */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Nome Completo / Razão Social *</label>
              <input
                type="text"
                required
                placeholder="Ex: João da Silva ou Empresa XYZ"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/80 border border-blue-900/40 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">WhatsApp com DDD *</label>
                <input
                  type="text"
                  required
                  placeholder="(15) 99999-9999"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/80 border border-blue-900/40 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 bg-slate-950/80 border border-blue-900/40 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 bg-slate-950/80 border border-blue-900/40 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Senha para Acesso</label>
                <input
                  type="password"
                  placeholder="Crie uma senha"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/80 border border-blue-900/40 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Address fields */}
            <div className="p-3 bg-slate-950/70 border border-blue-900/30 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-blue-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Endereço para Entrega (Auto-busca CEP)
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
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Salvando Cadastro...' : 'Criar Conta e Acessar'}</span>
            </button>
          </form>
        )}

        {/* TAB 3: ADMIN ACCESS (STRICT MAURICIOM2M / 78645524) */}
        {activeTab === 'admin' && (
          <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/80 via-slate-900 to-indigo-950/60 border border-blue-500/40 space-y-2 shadow-lg">
              <div className="flex items-center gap-2 text-blue-300 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Autenticação Restrita de Administrador</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Acesso exclusivo para <strong>MauricioM2M</strong> incluir produtos, editar estoque, visualizar dados dos clientes, gerenciar pedidos e configurações.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Usuário de Administrador</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="MauricioM2M"
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-blue-800/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
                <User className="w-4 h-4 text-blue-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Senha de Administrador</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Digite sua senha exclusiva"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-blue-800/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <KeyRound className="w-4 h-4 text-blue-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black text-xs shadow-xl shadow-blue-950 flex items-center justify-center gap-2 transition-all border border-blue-400/40 hover:scale-[1.01]"
            >
              <ShieldCheck className="w-4 h-4 text-blue-200" />
              <span>{loading ? 'Validando Acesso...' : 'Entrar no Painel do Administrador'}</span>
              <ArrowRight className="w-4 h-4 text-blue-200" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
