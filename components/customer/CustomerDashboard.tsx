'use client';

import React, { useState } from 'react';
import {
  User,
  ShoppingBag,
  FileText,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  MessageCircle,
  Eye,
  Printer,
  ChevronRight,
  ShieldAlert,
  Save,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useNotification } from '@/contexts/NotificationContext';
import { getOrders, getQuotes, getCompanySettings, saveCustomer } from '@/lib/storage';
import { formatBRL, formatDateBR, ORDER_STATUS_MAP, QUOTE_STATUS_MAP, buildWhatsAppLink } from '@/lib/formatters';
import { Order, Quote } from '@/lib/types';
import { PrintReceiptModal } from '@/components/common/PrintReceiptModal';

interface CustomerDashboardProps {
  initialTab?: 'orders' | 'quotes' | 'profile';
  onExploreProducts: () => void;
}

export function CustomerDashboard({ initialTab = 'orders', onExploreProducts }: CustomerDashboardProps) {
  const { user, customer, isCustomer, isAdmin } = useAuth();
  const { addItem } = useCart();
  const { showToast } = useNotification();
  const settings = getCompanySettings();

  const [activeTab, setActiveTab] = useState<'orders' | 'quotes' | 'profile'>(initialTab);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);

  // Profile Form States
  const [name, setName] = useState(customer?.name || user?.name || '');
  const [phone, setPhone] = useState(customer?.phone || user?.phone || '');
  const [whatsapp, setWhatsapp] = useState(customer?.whatsapp || '');
  const [cpfCnpj, setCpfCnpj] = useState(customer?.cpfCnpj || '');
  const [address, setAddress] = useState(customer?.address || '');
  const [number, setNumber] = useState(customer?.number || '');
  const [neighborhood, setNeighborhood] = useState(customer?.neighborhood || '');
  const [city, setCity] = useState(customer?.city || 'São Paulo');
  const [state, setState] = useState(customer?.state || 'SP');
  const [zipCode, setZipCode] = useState(customer?.zipCode || '');

  // Filter orders and quotes for current logged user / email
  const allOrders = getOrders();
  const allQuotes = getQuotes();

  const customerEmail = (user?.email || customer?.email || '').toLowerCase();
  const myOrders = allOrders.filter(
    (o) =>
      o.customerId === customer?.id ||
      (customerEmail && o.customerEmail.toLowerCase() === customerEmail)
  );

  const myQuotes = allQuotes.filter(
    (q) =>
      q.customerId === customer?.id ||
      (customerEmail && q.customerEmail.toLowerCase() === customerEmail)
  );

  const handleReorder = (order: Order) => {
    // Add all products to cart
    order.items.forEach((it) => {
      // Find base product or mock fallback
      const productMock: any = {
        id: it.productId,
        code: it.sku || 'PRD-REP',
        name: it.productName,
        price: it.unitPrice,
        images: [{ id: 'img-rep', productId: it.productId, url: it.productImage, isPrimary: true, order: 1 }],
      };
      addItem(productMock, {
        quantity: it.quantity,
        customization: it.customization,
      });
    });

    showToast('success', 'Itens Adicionados!', 'Os produtos do pedido foram copiados para seu carrinho.');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      showToast('warning', 'Campos Obrigatórios', 'Nome e telefone são necessários.');
      return;
    }

    saveCustomer({
      id: customer?.id,
      userId: user?.id,
      name,
      phone,
      whatsapp: whatsapp || phone.replace(/\D/g, ''),
      cpfCnpj,
      address,
      number,
      neighborhood,
      city,
      state,
      zipCode,
    });

    showToast('success', 'Perfil Atualizado!', 'Seus dados foram salvos com sucesso.');
  };

  const handleWhatsAppStatus = (order: Order) => {
    const msg = `Olá, M2MBrasil!\n\nGostaria de acompanhar o andamento do meu pedido *${order.orderNumber}* (${ORDER_STATUS_MAP[order.status]?.label || order.status}).\n\nNome: ${order.customerName}`;
    const link = buildWhatsAppLink(settings.whatsapp, msg);
    window.open(link, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-800/40 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 border border-blue-400/40 flex items-center justify-center text-white font-black text-2xl shadow-lg">
            {(user?.name || customer?.name || 'C').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {user?.name || customer?.name || 'Cliente M2MBrasil'}
              </h1>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Área do Cliente
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">{user?.email || customer?.email}</p>
          </div>
        </div>

        {/* Quick Tabs */}
        <div className="flex flex-wrap gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Meus Pedidos ({myOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('quotes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'quotes'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Orçamentos ({myQuotes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Meus Dados</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Meus Pedidos & Timeline Tracker */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {myOrders.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="font-bold text-lg text-white">Você ainda não realizou nenhum pedido</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Confira nosso catálogo com camisetas personalizadas, moletons, bonés e canecas de alta qualidade.
              </p>
              <button
                onClick={onExploreProducts}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg"
              >
                Explorar Produtos
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {myOrders.map((order) => {
                const statusMeta = ORDER_STATUS_MAP[order.status] || {
                  label: order.status,
                  bg: 'bg-slate-800',
                  text: 'text-slate-300',
                  step: 1,
                };

                return (
                  <div
                    key={order.id}
                    className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-blue-900/40 space-y-5 shadow-xl hover:border-blue-700/50 transition-all"
                  >
                    {/* Top Order Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-black text-base text-white">{order.orderNumber}</span>
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusMeta.bg} ${statusMeta.text}`}
                          >
                            {statusMeta.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Realizado em: {formatDateBR(order.createdAt)} • {order.items.length} itens
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-blue-300">
                          {formatBRL(order.total)}
                        </span>
                        <button
                          onClick={() => setOrderToPrint(order)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Imprimir Comprovante do Pedido"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Timeline Visualizer */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                      <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Linha do Tempo de Produção:
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-2 text-[11px]">
                        {[
                          { key: 'novo', label: '1. Recebido', step: 1 },
                          { key: 'pagamento', label: '2. Pagamento', step: 2 },
                          { key: 'arte', label: '3. Criação Arte', step: 3 },
                          { key: 'aprovacao', label: '4. Arte Aprovada', step: 4 },
                          { key: 'producao', label: '5. Em Produção', step: 5 },
                          { key: 'pronto', label: '6. Pronto / Expedição', step: 6 },
                          { key: 'entregue', label: '7. Entregue', step: 8 },
                        ].map((s) => {
                          const isDone = statusMeta.step >= s.step;
                          const isCurrent = statusMeta.step === s.step;
                          return (
                            <div
                              key={s.key}
                              className={`p-2 rounded-xl border text-center transition-all ${
                                isDone
                                  ? 'bg-blue-950/60 border-blue-500/60 text-blue-200'
                                  : 'bg-slate-900/40 border-slate-800 text-slate-500'
                              } ${isCurrent ? 'ring-2 ring-blue-400 font-bold' : ''}`}
                            >
                              <p className="font-semibold">{s.label}</p>
                              <span className="text-[10px] block mt-0.5">
                                {isDone ? '✓ Concluído' : 'Aguardando'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Items Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {order.items.map((it) => (
                        <div
                          key={it.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800"
                        >
                          <div className="w-12 h-12 rounded-lg bg-slate-900 overflow-hidden shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={it.productImage || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200'}
                              alt={it.productName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0 text-xs">
                            <p className="font-bold text-white truncate">{it.productName}</p>
                            <p className="text-slate-400">
                              {it.quantity}x • {it.colorName || 'Cor padrão'} ({it.sizeName || 'Tam. Único'})
                            </p>
                          </div>
                          <span className="text-xs font-bold text-blue-300">
                            {formatBRL(it.subtotal)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="text-xs text-slate-400">
                        Endereço: {order.shippingAddress?.address}, {order.shippingAddress?.number} - {order.shippingAddress?.city}/{order.shippingAddress?.state}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleWhatsAppStatus(order)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/50 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Dúvida no WhatsApp</span>
                        </button>

                        <button
                          onClick={() => handleReorder(order)}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Comprar Novamente</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Meus Orçamentos */}
      {activeTab === 'quotes' && (
        <div className="space-y-6">
          {myQuotes.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <p className="font-bold text-lg text-white">Nenhum orçamento solicitado ainda</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Você pode solicitar orçamentos personalizados com quantidades maiores e estampas exclusivas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myQuotes.map((quote) => {
                const qStatus = QUOTE_STATUS_MAP[quote.status] || {
                  label: quote.status,
                  bg: 'bg-slate-800',
                  text: 'text-slate-300',
                };
                return (
                  <div
                    key={quote.id}
                    className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-blue-900/40 space-y-4 shadow-xl"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-base text-white">{quote.quoteNumber}</span>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${qStatus.bg} ${qStatus.text}`}>
                            {qStatus.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Criado em: {formatDateBR(quote.createdAt)} • Validade até: {formatDateBR(quote.expiresAt)}
                        </p>
                      </div>
                      <span className="text-lg font-black text-blue-300">{formatBRL(quote.total)}</span>
                    </div>

                    <div className="space-y-2">
                      {quote.items.map((it) => (
                        <div key={it.id} className="flex justify-between items-center text-xs text-slate-300 p-2 rounded-xl bg-slate-950 border border-slate-800">
                          <div>
                            <p className="font-semibold text-white">{it.productName}</p>
                            <p className="text-slate-400 text-[11px]">
                              {it.quantity} unidades • {it.colorName} ({it.sizeName})
                            </p>
                          </div>
                          <span className="font-bold text-blue-200">{formatBRL(it.subtotal)}</span>
                        </div>
                      ))}
                    </div>

                    {quote.notes && (
                      <p className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <strong>Obs:</strong> {quote.notes}
                      </p>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => {
                          const msg = `Olá, M2MBrasil! Gostaria de aprovar e tirar dúvidas sobre o orçamento *${quote.quoteNumber}* no valor de ${formatBRL(quote.total)}.`;
                          const link = buildWhatsAppLink(settings.whatsapp, msg);
                          window.open(link, '_blank');
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Falar com Atendente / Aprovar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Meus Dados & Endereço */}
      {activeTab === 'profile' && (
        <form
          onSubmit={handleSaveProfile}
          className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-blue-900/40 space-y-6 shadow-xl max-w-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Meus Dados Cadastrais</h2>
              <p className="text-xs text-slate-400">Mantenha seu endereço e WhatsApp atualizados.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Nome Completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">E-mail</label>
              <input
                type="email"
                disabled
                value={user?.email || customer?.email || ''}
                className="w-full px-3 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-400 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Telefone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">WhatsApp</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">CPF / CNPJ</label>
              <input
                type="text"
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">CEP</label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-slate-300 font-semibold">Endereço</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Número</label>
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Bairro</label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-900/40"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      )}

      {/* Print receipt modal */}
      {orderToPrint && (
        <PrintReceiptModal order={orderToPrint} onClose={() => setOrderToPrint(null)} />
      )}
    </div>
  );
}
