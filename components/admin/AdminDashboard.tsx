'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Palette,
  FileText,
  Users,
  Ticket,
  Settings,
  Database,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Printer,
  Search,
  Filter,
  Save,
  Download,
  Upload,
  RefreshCw,
  Eye,
  ArrowUpRight,
  Sparkles,
  Image as ImageIcon,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  ExternalLink,
  X,
  Check,
} from 'lucide-react';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  getProducts,
  getCategories,
  getColors,
  getSizes,
  getOrders,
  getQuotes,
  getCustomers,
  getCoupons,
  getCompanySettings,
  saveProduct,
  deleteProduct,
  saveOrder,
  updateOrderStatus,
  saveQuote,
  deleteQuote,
  convertQuoteToOrder,
  saveCustomer,
  deleteCustomer,
  saveCoupon,
  deleteCoupon,
  saveCompanySettings,
  saveCategory,
  deleteCategory,
  saveColor,
  deleteColor,
  saveSize,
  deleteSize,
  exportDatabaseJSON,
  importDatabaseJSON,
  resetDatabase,
  subscribeDb,
} from '@/lib/storage';
import {
  formatBRL,
  formatDateBR,
  ORDER_STATUS_MAP,
  QUOTE_STATUS_MAP,
  PAYMENT_METHOD_MAP,
  ORDER_STATUS_STEPS,
} from '@/lib/formatters';
import {
  Category,
  Color,
  CompanySettings,
  Coupon,
  Customer,
  Order,
  OrderStatus,
  Product,
  Quote,
  Size,
} from '@/lib/types';
import { useNotification } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { PrintReceiptModal } from '@/components/common/PrintReceiptModal';

export function AdminDashboard() {
  const { showToast } = useNotification();
  const { user, isAdmin, login } = useAuth();

  // Admin login form state for lock screen
  const [adminUsername, setAdminUsername] = useState('MauricioM2M');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'orders'
    | 'products'
    | 'categories'
    | 'attributes'
    | 'quotes'
    | 'customers'
    | 'coupons'
    | 'settings'
    | 'database'
  >('overview');

  // Refresh trigger state
  const [tick, setTick] = useState(0);
  const triggerRefresh = () => setTick((t) => t + 1);

  // Entities
  const products = getProducts();
  const categories = getCategories();
  const colors = getColors();
  const sizes = getSizes();
  const orders = getOrders();
  const quotes = getQuotes();
  const customers = getCustomers();
  const coupons = getCoupons();
  const settings = getCompanySettings();

  // Modal / Selection states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  // Customer modal & search states
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  // Quote modal state
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  // Order filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Product filters
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState<string>('all');

  // Settings form
  const [settingsForm, setSettingsForm] = useState<CompanySettings>(settings);
  const [isSearchingCep, setIsSearchingCep] = useState(false);

  useEffect(() => {
    return subscribeDb(() => {
      triggerRefresh();
      setSettingsForm(getCompanySettings());
    });
  }, []);

  const handleSearchCep = async (cepValue: string) => {
    const cleanCep = (cepValue || '').replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      showToast('warning', 'CEP Inválido', 'O CEP deve conter 8 dígitos.');
      return;
    }
    setIsSearchingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      if (data.erro) {
        showToast('error', 'CEP Não Encontrado', 'Verifique o número informado.');
      } else {
        setSettingsForm((prev) => ({
          ...prev,
          address: data.logradouro || prev.address,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
          zipCode: cleanCep.replace(/(\d{5})(\d{3})/, '$1-$2'),
        }));
        showToast('success', 'Endereço Localizado!', `${data.localidade} - ${data.uf}`);
      }
    } catch {
      showToast('error', 'Erro ao consultar CEP', 'Preencha os campos manualmente.');
    } finally {
      setIsSearchingCep(false);
    }
  };

  // Computed Financials
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelado')
    .reduce((acc, o) => acc + o.total, 0);

  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'novo' || o.status === 'aguardando_pagamento' || o.status === 'arte_aguardando_aprovacao'
  ).length;

  const inProductionCount = orders.filter((o) => o.status === 'em_producao').length;

  // Chart data: Monthly revenue
  const revenueChartData = [
    { month: 'Jan', total: 18400, orders: 42 },
    { month: 'Fev', total: 22600, orders: 55 },
    { month: 'Mar', total: 29800, orders: 71 },
    { month: 'Abr', total: 26500, orders: 63 },
    { month: 'Mai', total: 34200, orders: 84 },
    { month: 'Jun', total: totalRevenue > 0 ? totalRevenue : 41900, orders: orders.length || 98 },
  ];

  // Category sales share
  const categoryShareData = [
    { name: 'Camisetas', value: 45, color: '#3b82f6' },
    { name: 'Moletons', value: 25, color: '#6366f1' },
    { name: 'Bonés', value: 15, color: '#0ea5e9' },
    { name: 'Canecas', value: 10, color: '#14b8a6' },
    { name: 'Uniformes', value: 5, color: '#8b5cf6' },
  ];

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    triggerRefresh();
    showToast('success', 'Status Atualizado!', `Pedido alterado para "${ORDER_STATUS_MAP[newStatus]?.label}".`);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };


  const handleConvertQuote = (quote: Quote) => {
    const newOrder = convertQuoteToOrder(quote.id);
    if (newOrder) {
      triggerRefresh();
      showToast('success', 'Orçamento Convertido!', `Pedido ${newOrder.orderNumber} gerado com sucesso.`);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveCompanySettings(settingsForm);
    triggerRefresh();
    showToast('success', 'Configurações Salvas!', 'Os dados da empresa e PIX foram atualizados.');
  };

  const handleExportBackup = () => {
    const dataStr = exportDatabaseJSON();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-m2m-brasil-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('success', 'Backup Exportado!', 'Arquivo JSON baixado com sucesso.');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = importDatabaseJSON(content);
      if (ok) {
        triggerRefresh();
        showToast('success', 'Backup Restaurado!', 'Todos os dados foram importados com sucesso.');
      } else {
        showToast('error', 'Falha na Restauração', 'Formato JSON inválido.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetSystem = () => {
    if (confirm('Atenção: Todos os dados serão restaurados para os valores originais de fábrica. Deseja continuar?')) {
      resetDatabase();
      triggerRefresh();
      showToast('info', 'Sistema Restaurado', 'Dados restaurados para o padrão de demonstração.');
    }
  };

  const handleAdminDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const success = await login(adminUsername, adminPassword);
      if (success) {
        showToast('success', 'Acesso Autorizado', 'Bem-vindo ao Painel de Controle, Maurício!');
      } else {
        setLoginError('Usuário ou senha de administrador incorretos. Apenas MauricioM2M tem acesso.');
      }
    } catch {
      setLoginError('Falha na autenticação do administrador.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="rounded-3xl bg-gradient-to-b from-slate-900 via-blue-950/80 to-slate-950 border border-blue-800/60 p-8 shadow-2xl text-slate-100 relative overflow-hidden">
          {/* Background decorative glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center relative z-10 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-xl shadow-blue-900/40 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Acesso Restrito ao Administrador
              </h2>
              <p className="text-xs text-blue-200/80 mt-1 max-w-sm mx-auto">
                Este painel de controle e todas as operações de CRUD (Produtos, Clientes, Pedidos, Estoque) são de acesso exclusivo do administrador <strong>MauricioM2M</strong>.
              </p>
            </div>

            {user && (
              <div className="p-3 rounded-xl bg-blue-950/50 border border-blue-800/40 text-xs text-blue-200">
                Você está conectado como cliente (<strong>{user.name}</strong>). Clientes têm acesso apenas à visualização do catálogo e envio de orçamentos.
              </div>
            )}

            <form onSubmit={handleAdminDirectLogin} className="space-y-4 text-left pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Usuário de Administrador
                </label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="MauricioM2M"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-blue-800/50 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Senha do Administrador
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Digite sua senha de admin"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-blue-800/50 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-900/40 transition-all border border-blue-400/30 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isLoggingIn ? 'Autenticando...' : 'Entrar no Painel Administrativo'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-800/40 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-400/40 flex items-center justify-center text-white shadow-lg">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Painel Administrativo M2MBrasil
              </h1>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                Gestão 360°
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Controle de pedidos, catálogo, estoque, orçamentos, clientes e finanças.
            </p>
          </div>
        </div>

        {/* Quick action badges */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingProduct({
                id: '',
                code: `PRD-${Math.floor(100 + Math.random() * 900)}`,
                name: '',
                slug: '',
                categoryId: categories[0]?.id || '',
                price: 50,
                cost: 25,
                stock: 100,
                minQuantity: 1,
                active: true,
                featured: false,
                isPromotion: false,
                allowCustomization: true,
                description: '',
                shortDescription: '',
                images: [
                  {
                    id: `img-${Date.now()}`,
                    productId: '',
                    url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600',
                    isPrimary: true,
                    order: 1,
                  },
                ],
                availableColors: colors.slice(0, 4),
                availableSizes: sizes.slice(0, 4),
                variants: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
              setIsProductModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
          >

            <Plus className="w-4 h-4" />
            <span>Novo Produto</span>
          </button>

          <button
            onClick={triggerRefresh}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Atualizar Dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {[
          { id: 'overview', label: 'Visão Geral & Gráficos', icon: LayoutDashboard },
          { id: 'orders', label: `Pedidos (${orders.length})`, icon: ShoppingBag },
          { id: 'products', label: `Produtos (${products.length})`, icon: Package },
          { id: 'categories', label: `Categorias (${categories.length})`, icon: Layers },
          { id: 'attributes', label: 'Cores & Tamanhos', icon: Palette },
          { id: 'quotes', label: `Orçamentos (${quotes.length})`, icon: FileText },
          { id: 'customers', label: `Clientes (${customers.length})`, icon: Users },
          { id: 'coupons', label: `Cupons (${coupons.length})`, icon: Ticket },
          { id: 'settings', label: 'Empresa & PIX', icon: Settings },
          { id: 'database', label: 'Backup & Dados', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 border border-blue-400/40'
                  : 'bg-slate-900/80 border border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: VISÃO GERAL & GRÁFICOS */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          {/* KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-blue-900/40 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Faturamento Total</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-white">{formatBRL(totalRevenue)}</p>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +18.4% vs mês anterior
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-blue-900/40 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Pedidos Pendentes</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-amber-300">{pendingOrdersCount}</p>
              <span className="text-[11px] text-slate-400">Aguardando arte ou pagamento</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-blue-900/40 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Em Produção Agora</span>
                <Sparkles className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-black text-blue-300">{inProductionCount}</p>
              <span className="text-[11px] text-blue-200">Na linha de estamparia</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-blue-900/40 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Total de Clientes</span>
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-black text-indigo-300">{customers.length}</p>
              <span className="text-[11px] text-indigo-200">Base cadastrada ativa</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Revenue Trend Area Chart */}
            <div className="lg:col-span-8 p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-blue-900/40 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm text-white">Evolução do Faturamento Mensal (R$)</h3>
                <span className="text-xs text-blue-300 font-semibold">2026</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChartData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `R$${v / 1000}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                      formatter={(value: any) => [formatBRL(Number(value)), 'Faturamento']}
                    />
                    <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Distribution Pie Chart */}
            <div className="lg:col-span-4 p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-blue-900/40 space-y-4">
              <h3 className="font-bold text-sm text-white">Distribuição por Categoria</h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryShareData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryShareData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                      formatter={(val: any) => [`${val}%`, 'Participação']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                {categoryShareData.map((c) => (
                  <div key={c.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span>{c.name}: {c.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders Overview Table */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-blue-900/40 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-white">Últimos Pedidos Recebidos</h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-semibold text-blue-300 hover:text-blue-200 flex items-center gap-1"
              >
                <span>Ver todos os pedidos</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3">Número</th>
                    <th className="pb-3">Cliente</th>
                    <th className="pb-3">Data</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Valor</th>
                    <th className="pb-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {orders.slice(0, 5).map((ord) => {
                    const statusMeta = ORDER_STATUS_MAP[ord.status] || {
                      label: ord.status,
                      bg: 'bg-slate-800',
                      text: 'text-slate-300',
                    };
                    return (
                      <tr key={ord.id} className="hover:bg-slate-850/50">
                        <td className="py-3 font-bold text-white">{ord.orderNumber}</td>
                        <td className="py-3">{ord.customerName}</td>
                        <td className="py-3 text-slate-400">{formatDateBR(ord.createdAt)}</td>
                        <td className="py-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusMeta.bg} ${statusMeta.text}`}
                          >
                            {statusMeta.label}
                          </span>
                        </td>
                        <td className="py-3 font-bold text-blue-300">{formatBRL(ord.total)}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedOrder(ord);
                              setActiveTab('orders');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 text-[11px] font-semibold transition-colors"
                          >
                            Gerenciar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GESTÃO DE PEDIDOS */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-blue-900/40 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-[260px]">
              <div className="relative flex-1 max-w-sm">
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Buscar por número, cliente ou CPF..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Todos os Status</option>
                {ORDER_STATUS_STEPS.map((s) => (
                  <option key={s.status} value={s.status}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-blue-900/40 space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3">Número</th>
                    <th className="pb-3">Cliente & Contato</th>
                    <th className="pb-3">Itens</th>
                    <th className="pb-3">Pagamento</th>
                    <th className="pb-3">Status de Produção</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(() => {
                    const filtered = orders.filter((o) => {
                      if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) {
                        return false;
                      }
                      if (orderSearch.trim()) {
                        const q = orderSearch.toLowerCase();
                        const matchNum = o.orderNumber.toLowerCase().includes(q);
                        const matchName = o.customerName.toLowerCase().includes(q);
                        const matchPhone = o.customerPhone.toLowerCase().includes(q);
                        if (!matchNum && !matchName && !matchPhone) return false;
                      }
                      return true;
                    });

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            <p className="font-bold text-sm text-slate-300">Nenhum pedido registrado no momento</p>
                            <p className="text-xs text-slate-500 mt-1">Os novos pedidos realizados pelos clientes ou convertidos de orçamentos aparecerão aqui.</p>
                          </td>
                        </tr>
                      );
                    }

                    return filtered.map((ord) => {
                      const statusMeta = ORDER_STATUS_MAP[ord.status] || {
                        label: ord.status,
                        bg: 'bg-slate-800',
                        text: 'text-slate-300',
                      };

                      return (
                        <tr key={ord.id} className="hover:bg-slate-850/50">
                          <td className="py-3 font-bold text-white">
                            <span>{ord.orderNumber}</span>
                            <span className="block text-[10px] text-slate-500 font-normal">
                              {formatDateBR(ord.createdAt)}
                            </span>
                          </td>
                          <td className="py-3">
                            <p className="font-semibold text-white">{ord.customerName}</p>
                            <p className="text-[11px] text-slate-400">{ord.customerWhatsapp || ord.customerPhone}</p>
                          </td>
                          <td className="py-3">
                            <span className="font-medium text-slate-200">
                              {ord.items.length} {ord.items.length === 1 ? 'item' : 'itens'}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="text-[11px] uppercase font-semibold text-slate-300">
                              {PAYMENT_METHOD_MAP[ord.paymentMethod] || ord.paymentMethod}
                            </span>
                            <span
                              className={`block text-[10px] font-bold ${
                                ord.paymentStatus === 'pago' ? 'text-emerald-400' : 'text-amber-400'
                              }`}
                            >
                              {ord.paymentStatus.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3">
                            <select
                              value={ord.status}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as any)}
                              className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              {ORDER_STATUS_STEPS.map((s) => (
                                <option key={s.status} value={s.status}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 font-black text-blue-300">{formatBRL(ord.total)}</td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setOrderToPrint(ord)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                                title="Imprimir Comprovante"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setSelectedOrder(ord)}
                                className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300"
                                title="Ver Detalhes do Pedido"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CATÁLOGO DE PRODUTOS */}
      {activeTab === 'products' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-blue-900/40 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-[260px]">
              <div className="relative flex-1 max-w-sm">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Filtrar por nome ou código..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>

              <select
                value={productCatFilter}
                onChange={(e) => setProductCatFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">Todas as Categorias</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setEditingProduct({
                  id: '',
                  code: `PRD-${Math.floor(100 + Math.random() * 900)}`,
                  name: '',
                  slug: '',
                  categoryId: categories[0]?.id || '',
                  price: 49.9,
                  cost: 24.9,
                  stock: 50,
                  minQuantity: 1,
                  active: true,
                  featured: false,
                  isPromotion: false,
                  allowCustomization: true,
                  description: '',
                  shortDescription: '',
                  images: [
                    {
                      id: `img-${Date.now()}`,
                      productId: '',
                      url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600',
                      isPrimary: true,
                      order: 1,
                    },
                  ],
                  availableColors: colors.slice(0, 3),
                  availableSizes: sizes.slice(0, 3),
                  variants: [],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                });
                setIsProductModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Produto</span>
            </button>
          </div>

          {/* Products Table */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-blue-900/40 space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3">Código</th>
                    <th className="pb-3">Produto</th>
                    <th className="pb-3">Categoria</th>
                    <th className="pb-3">Preço Venda</th>
                    <th className="pb-3">Estoque</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(() => {
                    const filtered = products.filter((p) => {
                      if (productCatFilter !== 'all' && p.categoryId !== productCatFilter) {
                        return false;
                      }
                      if (productSearch.trim()) {
                        const q = productSearch.toLowerCase();
                        if (!p.name.toLowerCase().includes(q) && !p.code.toLowerCase().includes(q)) {
                          return false;
                        }
                      }
                      return true;
                    });

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            <p className="font-bold text-sm text-slate-300">Nenhum produto cadastrado no momento</p>
                            <p className="text-xs text-slate-500 mt-1">Clique no botão &quot;Cadastrar Novo Produto&quot; acima para adicionar seu primeiro produto real.</p>
                          </td>
                        </tr>
                      );
                    }

                    return filtered.map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-850/50">
                        <td className="py-3 font-mono font-bold text-blue-300">{prod.code}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-950 overflow-hidden shrink-0 border border-slate-800">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={prod.images[0]?.url || ''}
                                alt={prod.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-bold text-white">{prod.name}</p>
                              {prod.featured && (
                                <span className="text-[10px] font-bold text-yellow-400">★ Destaque</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-slate-400">{prod.categoryName}</td>
                        <td className="py-3 font-bold text-white">{formatBRL(prod.promotionalPrice || prod.price)}</td>
                        <td className="py-3">
                          <span
                            className={`font-semibold ${
                              prod.stock > 10 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {prod.stock} un
                          </span>
                        </td>
                        <td className="py-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              prod.active
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {prod.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingProduct(prod);
                                setIsProductModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300"
                              title="Editar Produto"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Deseja excluir o produto "${prod.name}"?`)) {
                                  deleteProduct(prod.id);
                                  triggerRefresh();
                                  showToast('info', 'Produto Removido', prod.name);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300"
                              title="Excluir Produto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CATEGORIAS */}
      {activeTab === 'categories' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-white">Categorias do Sistema</h3>
            <button
              onClick={() => {
                setEditingCategory({
                  id: '',
                  name: '',
                  slug: '',
                  description: '',
                  active: true,
                  order: categories.length + 1,
                });
                setIsCategoryModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
            >

              <Plus className="w-4 h-4" />
              <span>Nova Categoria</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm text-white">{cat.name}</h4>
                  <p className="text-xs text-slate-400">/{cat.slug}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setEditingCategory(cat);
                      setIsCategoryModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir categoria "${cat.name}"?`)) {
                        deleteCategory(cat.id);
                        triggerRefresh();
                        showToast('info', 'Categoria Excluída', cat.name);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: CORES & TAMANHOS */}
      {activeTab === 'attributes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
          {/* Colors Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-blue-900/40 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-blue-400" />
              <span>Tabela de Cores Cadastradas</span>
            </h3>
            <div className="space-y-2">
              {colors.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-5 h-5 rounded-full border border-slate-700 shadow-sm"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="font-bold text-white">{c.name}</span>
                    <span className="text-slate-500 font-mono text-[11px]">{c.hex}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Remover cor ${c.name}?`)) {
                        deleteColor(c.id);
                        triggerRefresh();
                      }
                    }}
                    className="text-rose-400 hover:text-rose-200 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Sizes Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-blue-900/40 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Grade de Tamanhos</span>
            </h3>
            <div className="space-y-2">
              {sizes.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                >
                  <div>
                    <span className="font-bold text-white">{s.name}</span>
                    {s.order && <span className="text-slate-500 text-[11px] ml-2">• Ordem: {s.order}</span>}
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Remover tamanho ${s.name}?`)) {
                        deleteSize(s.id);
                        triggerRefresh();
                      }
                    }}
                    className="text-rose-400 hover:text-rose-200 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ORÇAMENTOS */}
      {activeTab === 'quotes' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-blue-900/40 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h3 className="font-bold text-base text-white">Solicitações de Orçamentos</h3>
                <p className="text-xs text-slate-400">Propostas solicitadas pelos clientes na loja e WhatsApp.</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-800/40 self-start sm:self-auto">
                Total: {quotes.length} orçamentos
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3">Número</th>
                    <th className="pb-3">Cliente</th>
                    <th className="pb-3">Itens</th>
                    <th className="pb-3">Data</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Total Estimado</th>
                    <th className="pb-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {quotes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <p className="font-bold text-sm text-slate-300">Nenhum orçamento solicitado ainda</p>
                        <p className="text-xs text-slate-500 mt-1">Quando os clientes solicitarem orçamentos pela loja ou WhatsApp, eles serão listados aqui.</p>
                      </td>
                    </tr>
                  ) : (
                    quotes.map((q) => {
                      const qStatus = QUOTE_STATUS_MAP[q.status] || {
                        label: q.status,
                        bg: 'bg-slate-800',
                        text: 'text-slate-300',
                      };
                      return (
                        <tr key={q.id} className="hover:bg-slate-850/50">
                          <td className="py-3 font-mono font-bold text-white">{q.quoteNumber}</td>
                          <td className="py-3">
                            <p className="font-semibold text-white">{q.customerName}</p>
                            <p className="text-[11px] text-slate-400">{q.customerWhatsapp || q.customerPhone || q.customerEmail}</p>
                          </td>
                          <td className="py-3">
                            <span className="text-xs text-slate-300">
                              {q.items?.length || 0} produto(s) ({q.items?.reduce((s, i) => s + i.quantity, 0) || 0} un)
                            </span>
                          </td>
                          <td className="py-3 text-slate-400">{formatDateBR(q.createdAt)}</td>
                          <td className="py-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${qStatus.bg} ${qStatus.text}`}
                            >
                              {qStatus.label}
                            </span>
                          </td>
                          <td className="py-3 font-black text-blue-300">{formatBRL(q.total)}</td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedQuote(q)}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 transition-all"
                                title="Ver Detalhes do Orçamento"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Ver</span>
                              </button>
                              {q.status !== 'convertido' && (
                                <button
                                  onClick={() => handleConvertQuote(q)}
                                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Converter</span>
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  if (confirm(`Excluir o orçamento ${q.quoteNumber}?`)) {
                                    deleteQuote(q.id);
                                    triggerRefresh();
                                    showToast('info', 'Orçamento Removido', `Orçamento ${q.quoteNumber} excluído.`);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors"
                                title="Excluir Orçamento"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: CLIENTES */}
      {activeTab === 'customers' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-blue-900/40 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h3 className="font-bold text-base text-white">Gestão de Clientes</h3>
                <p className="text-xs text-slate-400">Controle completo da base de clientes cadastrados no sistema.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const nextNum = customers.length + 101;
                    setEditingCustomer({
                      id: '',
                      code: `CLI-${String(nextNum).padStart(6, '0')}`,
                      name: '',
                      cpfCnpj: '',
                      phone: '',
                      whatsapp: '',
                      email: '',
                      zipCode: '',
                      address: '',
                      number: '',
                      complement: '',
                      neighborhood: '',
                      city: '',
                      state: 'SP',
                      notes: '',
                      createdAt: new Date().toISOString(),
                      totalSpent: 0,
                      ordersCount: 0,
                    });
                    setIsCustomerModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Cliente</span>
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome, telefone, e-mail, CPF/CNPJ ou cidade..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Customers Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3">Código</th>
                    <th className="pb-3">Nome / Documento</th>
                    <th className="pb-3">Contato</th>
                    <th className="pb-3">Localização</th>
                    <th className="pb-3">Pedidos / Gasto</th>
                    <th className="pb-3">Cadastro</th>
                    <th className="pb-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <p className="font-bold text-sm text-slate-300">Nenhum cliente cadastrado no momento</p>
                        <p className="text-xs text-slate-500 mt-1">Clique em &quot;Novo Cliente&quot; ou aguarde cadastros pelo site.</p>
                      </td>
                    </tr>
                  ) : (
                    customers
                      .filter((c) => {
                        if (!customerSearch.trim()) return true;
                        const s = customerSearch.toLowerCase();
                        return (
                          c.name.toLowerCase().includes(s) ||
                          c.phone.toLowerCase().includes(s) ||
                          c.email.toLowerCase().includes(s) ||
                          (c.cpfCnpj && c.cpfCnpj.toLowerCase().includes(s)) ||
                          (c.city && c.city.toLowerCase().includes(s)) ||
                          (c.code && c.code.toLowerCase().includes(s))
                        );
                      })
                      .map((c) => {
                        const clientOrders = orders.filter(
                          (o) => o.customerId === c.id || o.customerPhone === c.phone || (c.email && o.customerEmail === c.email)
                        );
                        const spent = clientOrders.reduce((sum, o) => (o.status !== 'cancelado' ? sum + o.total : sum), 0) || c.totalSpent;
                        const totalOrdersCount = clientOrders.length || c.ordersCount;

                        return (
                          <tr key={c.id} className="hover:bg-slate-850/50">
                            <td className="py-3 font-mono font-bold text-blue-400">{c.code || 'CLI-000'}</td>
                            <td className="py-3">
                              <p className="font-bold text-white">{c.name}</p>
                              {c.cpfCnpj && <p className="text-[11px] text-slate-500 font-mono">Doc: {c.cpfCnpj}</p>}
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-1 text-slate-200">
                                <Phone className="w-3 h-3 text-emerald-400" />
                                <span>{c.phone}</span>
                              </div>
                              {c.email && <p className="text-[11px] text-slate-400 mt-0.5">{c.email}</p>}
                            </td>
                            <td className="py-3">
                              {c.city ? (
                                <p className="text-slate-300">{c.city} / {c.state || 'SP'}</p>
                              ) : (
                                <span className="text-slate-500">-</span>
                              )}
                              {c.neighborhood && <p className="text-[11px] text-slate-500">{c.neighborhood}</p>}
                            </td>
                            <td className="py-3">
                              <p className="font-bold text-emerald-400">{formatBRL(spent)}</p>
                              <p className="text-[11px] text-slate-400">{totalOrdersCount} pedido(s)</p>
                            </td>
                            <td className="py-3 text-slate-400">{formatDateBR(c.createdAt)}</td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedCustomer(c)}
                                  className="px-2.5 py-1.5 rounded-xl bg-blue-900/40 hover:bg-blue-800/60 text-blue-200 font-bold text-xs border border-blue-700/40 transition-all flex items-center gap-1"
                                  title="Ver Ficha Completa & Histórico"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Ver / Editar</span>
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Deseja realmente excluir o cliente "${c.name}"?`)) {
                                      deleteCustomer(c.id);
                                      triggerRefresh();
                                      showToast('info', 'Cliente Excluído', `Cliente ${c.name} foi removido.`);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors"
                                  title="Excluir Cliente"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: CUPONS */}
      {activeTab === 'coupons' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-white">Cupons de Desconto Ativos</h3>
            <button
              onClick={() => {
                setEditingCoupon({
                  id: '',
                  code: 'PROMO10',
                  discountType: 'percentage',
                  discountValue: 10,
                  usageCount: 0,
                  active: true,
                  createdAt: new Date().toISOString(),
                });
                setIsCouponModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Cupom</span>
            </button>
          </div>

          {coupons.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
              <p className="font-bold text-sm text-slate-300">Nenhum cupom de desconto criado ainda</p>
              <p className="text-xs text-slate-500 mt-1">Clique em &quot;Novo Cupom&quot; para criar códigos promocionais para seus clientes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {coupons.map((cp) => (
                <div
                  key={cp.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono font-black text-base text-blue-300">{cp.code}</span>
                    <p className="text-xs text-emerald-400 font-bold mt-0.5">
                      {cp.discountType === 'percentage' ? `${cp.discountValue}% OFF` : `${formatBRL(cp.discountValue)} OFF`}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir cupom ${cp.code}?`)) {
                        deleteCoupon(cp.id);
                        triggerRefresh();
                      }
                    }}
                    className="p-1.5 rounded-lg bg-rose-600/20 text-rose-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 9: CONFIGURAÇÕES DA EMPRESA */}
      {activeTab === 'settings' && (
        <form
          onSubmit={handleSaveSettings}
          className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-blue-900/40 space-y-6 shadow-xl max-w-4xl animate-in fade-in"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Dados Reais da Empresa & Configurações do Sistema</h2>
              <p className="text-xs text-slate-400">Preencha os dados oficiais de sua empresa para exibição no rodapé, cabeçalho, orçamentos e recibos.</p>
            </div>
          </div>

          {/* SEÇÃO 1: LOGOTIPO OFICIAL DA EMPRESA */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-blue-900/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm text-white">Logotipo Oficial da Empresa</h3>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Exibido no Cabeçalho, Rodapé e Recibos
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Preview Box */}
              <div className="space-y-2">
                <p className="text-[11px] text-slate-400 font-semibold">Pré-visualização do Logo:</p>
                <div className="flex gap-2">
                  {/* Dark mode preview */}
                  <div className="flex-1 h-20 rounded-xl bg-slate-900 border border-slate-800 p-2 flex flex-col items-center justify-center relative overflow-hidden">
                    <span className="text-[9px] text-slate-500 absolute top-1 left-2 font-mono">Fundo Escuro</span>
                    {settingsForm.logoUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={settingsForm.logoUrl}
                        alt="Logo Preview"
                        className="max-h-12 max-w-full object-contain"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-white font-black text-xs">
                          M2M
                        </div>
                        <span className="text-xs font-bold text-white">{settingsForm.companyName || 'M2MBrasil'}</span>
                      </div>
                    )}
                  </div>

                  {/* Light mode preview (for print receipts) */}
                  <div className="flex-1 h-20 rounded-xl bg-white border border-slate-300 p-2 flex flex-col items-center justify-center relative overflow-hidden">
                    <span className="text-[9px] text-slate-400 absolute top-1 left-2 font-mono">Impressão/Claro</span>
                    {settingsForm.logoUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={settingsForm.logoUrl}
                        alt="Logo Preview"
                        className="max-h-12 max-w-full object-contain"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">
                          M2M
                        </div>
                        <span className="text-xs font-bold text-slate-900">{settingsForm.companyName || 'M2MBrasil'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload or URL Controls */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                    Enviar Arquivo do Logotipo (PNG, JPG, SVG):
                  </label>
                  <label className="flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-700/60 hover:border-blue-500 rounded-xl cursor-pointer text-blue-200 text-xs font-bold transition-all shadow-md">
                    <Upload className="w-4 h-4 text-blue-400" />
                    <span>Selecionar Imagem do Computador</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024) {
                          showToast('error', 'Arquivo muito grande', 'O limite é de 5MB.');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const base64 = event.target?.result as string;
                          setSettingsForm({ ...settingsForm, logoUrl: base64 });
                          showToast('success', 'Logotipo Carregado!', 'Clique em Salvar Configurações para aplicar.');
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Ou informe a URL direta da imagem:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://exemplo.com/logo.png"
                      value={settingsForm.logoUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                      className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    {settingsForm.logoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setSettingsForm({ ...settingsForm, logoUrl: '' });
                          showToast('info', 'Logotipo Removido', 'Voltando ao emblema padrão M2M.');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs border border-rose-800/40"
                        title="Remover logotipo"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: IDENTIFICAÇÃO DA EMPRESA */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-blue-300 flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span>Identificação Jurídica / Cadastral</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1 sm:col-span-1">
                <label className="text-slate-300 font-semibold">Nome Fantasia da Empresa *</label>
                <input
                  type="text"
                  placeholder="Ex: M2MBrasil Produtos Personalizados"
                  value={settingsForm.companyName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, companyName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1 sm:col-span-1">
                <label className="text-slate-300 font-semibold">Razão Social</label>
                <input
                  type="text"
                  placeholder="Ex: M2M Brasil Confecções e Brindes Ltda"
                  value={settingsForm.tradeName || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, tradeName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-1">
                <label className="text-slate-300 font-semibold">CNPJ / CPF</label>
                <input
                  type="text"
                  placeholder="00.000.000/0001-00"
                  value={settingsForm.cnpj || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, cnpj: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 3: CONTATOS OFICIAIS & ATENDIMENTO */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span>Contatos & Canais de Atendimento</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">WhatsApp Oficial (com DDD) *</label>
                <input
                  type="text"
                  placeholder="15996019227"
                  value={settingsForm.whatsapp}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Telefone Comercial / Fixo</label>
                <input
                  type="text"
                  placeholder="(15) 99601-9227"
                  value={settingsForm.phone || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">E-mail Comercial / Atendimento</label>
                <input
                  type="email"
                  placeholder="contato@seusite.com.br"
                  value={settingsForm.email || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-3">
                <label className="text-slate-300 font-semibold">Mensagem Padrão ao Abrir WhatsApp</label>
                <input
                  type="text"
                  placeholder="Olá! Gostaria de fazer um orçamento de produtos personalizados..."
                  value={settingsForm.whatsappDefaultMessage || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsappDefaultMessage: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Instagram (@)</label>
                <input
                  type="text"
                  placeholder="@m2mbrasil"
                  value={settingsForm.instagram || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, instagram: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-300 font-semibold">Facebook</label>
                <input
                  type="text"
                  placeholder="facebook.com/m2mbrasil"
                  value={settingsForm.facebook || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, facebook: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 4: ENDEREÇO DA SEDE / LOJA */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-blue-300 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Endereço da Empresa</span>
              </h3>
              <span className="text-[11px] text-slate-400">Preencha se desejar exibir endereço no rodapé</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="space-y-1 sm:col-span-1">
                <label className="text-slate-300 font-semibold">CEP</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="18000-000"
                    value={settingsForm.zipCode || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, zipCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSearchCep(settingsForm.zipCode || '')}
                    disabled={isSearchingCep}
                    className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 transition-colors"
                    title="Buscar endereço pelo CEP"
                  >
                    {isSearchingCep ? '...' : 'Buscar'}
                  </button>
                </div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-300 font-semibold">Rua / Logradouro</label>
                <input
                  type="text"
                  placeholder="Nome da rua ou avenida"
                  value={settingsForm.address || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-1">
                <label className="text-slate-300 font-semibold">Número</label>
                <input
                  type="text"
                  placeholder="123"
                  value={settingsForm.number || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, number: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-300 font-semibold">Bairro</label>
                <input
                  type="text"
                  placeholder="Bairro"
                  value={settingsForm.neighborhood || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, neighborhood: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-1">
                <label className="text-slate-300 font-semibold">Cidade</label>
                <input
                  type="text"
                  placeholder="Cidade"
                  value={settingsForm.city || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, city: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-1">
                <label className="text-slate-300 font-semibold">Estado (UF)</label>
                <input
                  type="text"
                  placeholder="SP"
                  maxLength={2}
                  value={settingsForm.state || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, state: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white uppercase focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 5: CONFIGURAÇÕES PIX & FRETE */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-teal-300 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>Recebimento PIX & Regras de Frete</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Tipo de Chave PIX</label>
                <select
                  value={settingsForm.pixKeyType || 'celular'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, pixKeyType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="celular">Celular / Telefone</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="cpf">CPF</option>
                  <option value="email">E-mail</option>
                  <option value="aleatoria">Chave Aleatória (EVP)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Chave PIX</label>
                <input
                  type="text"
                  placeholder="15996019227"
                  value={settingsForm.pixKey || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, pixKey: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Nome do Titular / Favorecido PIX</label>
                <input
                  type="text"
                  placeholder="Maurício Mastorillo"
                  value={settingsForm.pixReceiverName || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, pixReceiverName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Cidade da Conta PIX</label>
                <input
                  type="text"
                  placeholder="Sorocaba"
                  value={settingsForm.pixCity || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, pixCity: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Frete Grátis a partir de (R$)</label>
                <input
                  type="number"
                  step="1"
                  value={settingsForm.minOrderValueForFreeShipping || 250}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      minOrderValueForFreeShipping: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Valor Padrão do Frete (R$)</label>
                <input
                  type="number"
                  step="0.50"
                  value={settingsForm.deliveryFeeDefault || 18}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      deliveryFeeDefault: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm flex items-center gap-2 shadow-xl shadow-blue-900/50 border border-blue-400/30 transition-all hover:scale-[1.01]"
            >
              <Save className="w-5 h-5" />
              <span>Salvar Dados Reais da Empresa</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 10: BACKUP & DADOS */}
      {activeTab === 'database' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-blue-900/40 space-y-6 shadow-xl max-w-3xl animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Exportação & Backup dos Dados</h2>
              <p className="text-xs text-slate-400">Salve ou restaure todo o banco de dados em JSON.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="font-bold text-sm text-white">Exportar Backup</h4>
              <p className="text-xs text-slate-400">
                Gera um arquivo JSON contendo todos os produtos, pedidos, clientes e configurações.
              </p>
              <button
                onClick={handleExportBackup}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Exportar Dados (JSON)</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="font-bold text-sm text-white">Importar Backup</h4>
              <p className="text-xs text-slate-400">
                Selecione um arquivo de backup previamente exportado para restaurar.
              </p>
              <label className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                <span>Carregar Arquivo JSON</span>
                <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-rose-400">Restaurar Padrão de Fábrica</p>
              <p className="text-[11px] text-slate-400">Recarrega os produtos e pedidos de demonstração.</p>
            </div>
            <button
              onClick={handleResetSystem}
              className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-700/50 text-rose-300 font-bold text-xs"
            >
              Resetar Demonstração
            </button>
          </div>
        </div>
      )}

      {/* Product Edit / Create Modal */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-blue-800/40 rounded-3xl p-6 space-y-4 text-xs text-white max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-400" />
                <span>{editingProduct.id ? 'Editar Produto' : 'Cadastrar Novo Produto'}</span>
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Código SKU</label>
                <input
                  type="text"
                  placeholder="PRD-001"
                  value={editingProduct.code}
                  onChange={(e) => setEditingProduct({ ...editingProduct, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Categoria *</label>
                <select
                  value={editingProduct.categoryId}
                  onChange={(e) => {
                    const cat = categories.find((c) => c.id === e.target.value);
                    setEditingProduct({
                      ...editingProduct,
                      categoryId: e.target.value,
                      categoryName: cat?.name || 'Geral',
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Nome do Produto *</label>
              <input
                type="text"
                placeholder="Ex: Camiseta Dry Fit UV50+ Personalizada"
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Preço de Venda (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-emerald-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Preço Promocional (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Opcional"
                  value={editingProduct.promotionalPrice || ''}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      promotionalPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Estoque (un)</label>
                <input
                  type="number"
                  value={editingProduct.stock}
                  onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>
            </div>

            {/* Imagem do Produto */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <label className="text-slate-300 font-semibold block">Foto Principal do Produto</label>
              <div className="flex gap-3 items-center">
                <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                  {editingProduct.images?.[0]?.url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={editingProduct.images[0].url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-slate-600" />
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <label className="flex items-center justify-center gap-2 px-3 py-1.5 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-700/60 rounded-xl cursor-pointer text-blue-200 text-xs font-bold transition-all">
                    <Upload className="w-3.5 h-3.5 text-blue-400" />
                    <span>Carregar Foto do Computador</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const base64 = event.target?.result as string;
                          setEditingProduct({
                            ...editingProduct,
                            images: [
                              {
                                id: `img-${Date.now()}`,
                                productId: editingProduct.id,
                                url: base64,
                                isPrimary: true,
                                order: 1,
                              },
                            ],
                          });
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                  <input
                    type="text"
                    placeholder="Ou digite a URL da imagem (https://...)"
                    value={editingProduct.images?.[0]?.url || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        images: [
                          {
                            id: 'img-1',
                            productId: editingProduct.id,
                            url: e.target.value,
                            isPrimary: true,
                            order: 1,
                          },
                        ],
                      })
                    }
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Cores Disponíveis */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Cores Disponíveis para este Produto</label>
              <div className="flex flex-wrap gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                {colors.map((c) => {
                  const isSelected = editingProduct.availableColors?.some((ac) => ac.id === c.id || ac.name === c.name);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        const current = editingProduct.availableColors || [];
                        const updated = isSelected
                          ? current.filter((ac) => ac.id !== c.id && ac.name !== c.name)
                          : [...current, c];
                        setEditingProduct({ ...editingProduct, availableColors: updated });
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border transition-all ${
                        isSelected
                          ? 'bg-blue-600/30 border-blue-500 text-white font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 opacity-60'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-700" style={{ backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tamanhos Disponíveis */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Grade de Tamanhos</label>
              <div className="flex flex-wrap gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                {sizes.map((s) => {
                  const isSelected = editingProduct.availableSizes?.some((as) => as.id === s.id || as.name === s.name);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        const current = editingProduct.availableSizes || [];
                        const updated = isSelected
                          ? current.filter((as) => as.id !== s.id && as.name !== s.name)
                          : [...current, s];
                        setEditingProduct({ ...editingProduct, availableSizes: updated });
                      }}
                      className={`px-3 py-1 rounded-lg text-xs border transition-all ${
                        isSelected
                          ? 'bg-blue-600/30 border-blue-500 text-white font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 opacity-60'
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Descrição do Produto</label>
              <textarea
                placeholder="Detalhes sobre o tecido, acabamento, personalização..."
                value={editingProduct.description}
                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
              />
            </div>

            <div className="flex gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingProduct.active}
                  onChange={(e) => setEditingProduct({ ...editingProduct, active: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <span>Ativo no Catálogo</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingProduct.featured}
                  onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <span>Produto em Destaque</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!editingProduct.name.trim()) {
                    showToast('error', 'Nome Obrigatório', 'Por favor, informe o nome do produto.');
                    return;
                  }
                  saveProduct(editingProduct);
                  setIsProductModalOpen(false);
                  triggerRefresh();
                  showToast('success', 'Produto Salvo com Sucesso!', editingProduct.name);
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-900/40"
              >
                Salvar Produto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer View & Edit Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-blue-800/40 rounded-3xl p-6 space-y-5 text-xs text-white max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Ficha do Cliente: {selectedCustomer.name}</h3>
                <span className="font-mono text-[11px] text-blue-300 bg-blue-950 px-2 py-0.5 rounded border border-blue-800/40">
                  {selectedCustomer.code}
                </span>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Nome Completo *</label>
                <input
                  type="text"
                  value={selectedCustomer.name}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">CPF / CNPJ</label>
                <input
                  type="text"
                  value={selectedCustomer.cpfCnpj || ''}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, cpfCnpj: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Telefone / WhatsApp *</label>
                <input
                  type="text"
                  value={selectedCustomer.phone}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, phone: e.target.value, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">E-mail</label>
                <input
                  type="email"
                  value={selectedCustomer.email || ''}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-300 font-semibold">Endereço de Entrega</label>
                <input
                  type="text"
                  placeholder="Rua, Número, Bairro, Complemento"
                  value={selectedCustomer.address || ''}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Cidade</label>
                <input
                  type="text"
                  value={selectedCustomer.city || ''}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, city: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Estado (UF)</label>
                <input
                  type="text"
                  maxLength={2}
                  value={selectedCustomer.state || 'SP'}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, state: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white uppercase"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-300 font-semibold">Observações Internas</label>
                <textarea
                  rows={2}
                  placeholder="Anotações sobre preferências do cliente, prazos especiais..."
                  value={selectedCustomer.notes || ''}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>
            </div>

            {/* Pedidos do Cliente */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <h4 className="font-bold text-xs text-blue-300">Histórico de Pedidos deste Cliente</h4>
              {orders.filter((o) => o.customerId === selectedCustomer.id || o.customerPhone === selectedCustomer.phone).length === 0 ? (
                <p className="text-xs text-slate-500 italic">Nenhum pedido realizado ainda.</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {orders
                    .filter((o) => o.customerId === selectedCustomer.id || o.customerPhone === selectedCustomer.phone)
                    .map((ord) => (
                      <div
                        key={ord.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                      >
                        <div>
                          <span className="font-mono font-bold text-white">{ord.orderNumber}</span>
                          <span className="text-slate-400 ml-2">({formatDateBR(ord.createdAt)})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-emerald-400">{formatBRL(ord.total)}</span>
                          <button
                            onClick={() => {
                              setSelectedCustomer(null);
                              setOrderToPrint(ord);
                            }}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200"
                          >
                            Imprimir
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  if (!selectedCustomer.name.trim()) {
                    showToast('error', 'Nome Obrigatório', 'Informe o nome do cliente.');
                    return;
                  }
                  saveCustomer(selectedCustomer);
                  setSelectedCustomer(null);
                  triggerRefresh();
                  showToast('success', 'Cliente Atualizado!', selectedCustomer.name);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-md"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Create Modal */}
      {isCustomerModalOpen && editingCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-blue-800/40 rounded-3xl p-6 space-y-4 text-xs text-white max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span>Cadastrar Novo Cliente</span>
              </h3>
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Nome Completo *</label>
                <input
                  type="text"
                  placeholder="Nome do cliente ou razão social"
                  value={editingCustomer.name}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">CPF / CNPJ</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={editingCustomer.cpfCnpj || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, cpfCnpj: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Telefone / WhatsApp *</label>
                <input
                  type="text"
                  placeholder="(15) 99999-9999"
                  value={editingCustomer.phone}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">E-mail</label>
                <input
                  type="email"
                  placeholder="cliente@email.com"
                  value={editingCustomer.email || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-300 font-semibold">Endereço de Entrega</label>
                <input
                  type="text"
                  placeholder="Rua, Número, Bairro, Complemento"
                  value={editingCustomer.address || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Cidade</label>
                <input
                  type="text"
                  placeholder="Cidade"
                  value={editingCustomer.city || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, city: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Estado (UF)</label>
                <input
                  type="text"
                  placeholder="SP"
                  maxLength={2}
                  value={editingCustomer.state || 'SP'}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, state: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white uppercase"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!editingCustomer.name.trim() || !editingCustomer.phone.trim()) {
                    showToast('error', 'Campos Obrigatórios', 'Informe ao menos o nome e o telefone do cliente.');
                    return;
                  }
                  saveCustomer(editingCustomer);
                  setIsCustomerModalOpen(false);
                  triggerRefresh();
                  showToast('success', 'Cliente Cadastrado com Sucesso!', editingCustomer.name);
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-900/40"
              >
                Cadastrar Cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quote Detail Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 border border-blue-800/40 rounded-3xl p-6 space-y-4 text-xs text-white max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Orçamento {selectedQuote.quoteNumber}</h3>
                <p className="text-xs text-slate-400">Solicitado em {formatDateBR(selectedQuote.createdAt)}</p>
              </div>
              <button
                onClick={() => setSelectedQuote(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <p className="font-bold text-white text-sm">{selectedQuote.customerName}</p>
              <p className="text-slate-300">WhatsApp / Telefone: {selectedQuote.customerWhatsapp || selectedQuote.customerPhone || '-'}</p>
              <p className="text-slate-300">E-mail: {selectedQuote.customerEmail || '-'}</p>
              {selectedQuote.customerCompany && <p className="text-slate-400">Empresa: {selectedQuote.customerCompany}</p>}
            </div>

            {/* Items */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-blue-300">Itens do Orçamento:</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedQuote.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-bold text-white">{item.productName}</p>
                      <p className="text-[11px] text-slate-400">
                        {item.quantity} un • Cor: {item.colorName || '-'} • Tam: {item.sizeName || '-'}
                      </p>
                      {item.customizationNotes && (
                        <p className="text-[11px] text-blue-300 italic mt-0.5">Arte: {item.customizationNotes}</p>
                      )}
                    </div>
                    <span className="font-black text-blue-300">{formatBRL(item.subtotal || (item.unitPrice * item.quantity))}</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedQuote.notes && (
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-blue-200 text-xs">
                <strong>Observações do Cliente:</strong> {selectedQuote.notes}
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <div>
                <span className="text-slate-400 text-xs">Total Estimado:</span>
                <p className="text-lg font-black text-emerald-400">{formatBRL(selectedQuote.total)}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedQuote(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Fechar
                </button>
                {selectedQuote.status !== 'convertido' && (
                  <button
                    onClick={() => {
                      handleConvertQuote(selectedQuote);
                      setSelectedQuote(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-md flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Converter em Pedido</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-slate-900 border border-blue-800/40 rounded-3xl p-6 space-y-4 text-xs text-white shadow-2xl">
            <h3 className="text-base font-bold text-white">Categoria</h3>
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Nome da Categoria</label>
              <input
                type="text"
                placeholder="Ex: Canecas Personalizadas"
                value={editingCategory.name}
                onChange={(e) =>
                  setEditingCategory({
                    ...editingCategory,
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                  })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  saveCategory(editingCategory);
                  setIsCategoryModalOpen(false);
                  triggerRefresh();
                  showToast('success', 'Categoria Salva!', editingCategory.name);
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
              >
                Salvar Categoria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {isCouponModalOpen && editingCoupon && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-slate-900 border border-blue-800/40 rounded-3xl p-6 space-y-4 text-xs text-white shadow-2xl">
            <h3 className="text-base font-bold text-white">Cupom de Desconto</h3>
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Código do Cupom</label>
              <input
                type="text"
                value={editingCoupon.code}
                onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Tipo</label>
                <select
                  value={editingCoupon.discountType}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, discountType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                >
                  <option value="percentage">Porcentagem (%)</option>
                  <option value="fixed">Fixo (R$)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Valor</label>
                <input
                  type="number"
                  value={editingCoupon.discountValue}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, discountValue: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  saveCoupon(editingCoupon);
                  setIsCouponModalOpen(false);
                  triggerRefresh();
                  showToast('success', 'Cupom Salvo!', editingCoupon.code);
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
              >
                Salvar Cupom
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print receipt modal */}
      {orderToPrint && (
        <PrintReceiptModal order={orderToPrint} onClose={() => setOrderToPrint(null)} />
      )}
    </div>
  );
}
