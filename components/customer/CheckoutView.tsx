'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Copy,
  CreditCard,
  QrCode,
  Truck,
  User,
  MapPin,
  FileCheck,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  MessageCircle,
  Download,
  Printer,
  FileText,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { getCompanySettings, saveOrder, saveCustomer } from '@/lib/storage';
import { formatBRL, buildWhatsAppLink } from '@/lib/formatters';
import { Order, PaymentMethod } from '@/lib/types';
import { downloadOrderPDF, formatWhatsAppOrderMessage } from '@/lib/pdfGenerator';
import { PrintReceiptModal } from '@/components/common/PrintReceiptModal';

interface CheckoutViewProps {
  onBackToStore: () => void;
  onOrderSuccess: (order: Order) => void;
}

export function CheckoutView({ onBackToStore, onOrderSuccess }: CheckoutViewProps) {
  const { items, subtotal, discount, shipping, total, clearCart } = useCart();
  const { customer, user } = useAuth();
  const { showToast } = useNotification();
  const settings = getCompanySettings();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State
  const [name, setName] = useState(customer?.name || user?.name || '');
  const [email, setEmail] = useState(customer?.email || user?.email || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [whatsapp, setWhatsapp] = useState(customer?.whatsapp || '');
  const [cpfCnpj, setCpfCnpj] = useState(customer?.cpfCnpj || '');

  // Address
  const [zipCode, setZipCode] = useState(customer?.zipCode || '');
  const [address, setAddress] = useState(customer?.address || '');
  const [number, setNumber] = useState(customer?.number || '');
  const [complement, setComplement] = useState(customer?.complement || '');
  const [neighborhood, setNeighborhood] = useState(customer?.neighborhood || '');
  const [city, setCity] = useState(customer?.city || 'São Paulo');
  const [state, setState] = useState(customer?.state || 'SP');
  const [orderNotes, setOrderNotes] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [installments, setInstallments] = useState('1');

  // Completed Order
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);

  // CEP lookup helper
  const handleCepBlur = async () => {
    const cleanCep = zipCode.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setAddress(data.logradouro || '');
          setNeighborhood(data.bairro || '');
          setCity(data.localidade || '');
          setState(data.uf || '');
          showToast('info', 'Endereço encontrado!', `${data.logradouro}, ${data.localidade}`);
        }
      } catch (e) {
        console.warn('CEP lookup failed', e);
      }
    }
  };

  const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);

  const handleFinishOrder = () => {
    if (items.length === 0) {
      showToast('error', 'Carrinho vazio', 'Adicione produtos para finalizar.');
      return;
    }

    const orderItems = items.map((it) => ({
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId: it.product.id,
      productName: it.product.name,
      productImage: it.product.images[0]?.url || '',
      colorName: it.selectedColor?.name,
      colorHex: it.selectedColor?.hex,
      sizeName: it.selectedSize?.name,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      subtotal: it.unitPrice * it.quantity,
      customization: it.customization,
    }));

    // Auto-save or update customer profile if new
    let assignedCustomerId = customer?.id || 'cust-' + Date.now();
    if (!customer) {
      const newCust = saveCustomer({
        name,
        email: email || `${phone.replace(/\D/g, '')}@cliente.com.br`,
        phone,
        whatsapp: whatsapp || phone.replace(/\D/g, ''),
        cpfCnpj,
        zipCode,
        address,
        number,
        complement,
        neighborhood,
        city,
        state,
        ordersCount: 1,
        totalSpent: total,
      });
      assignedCustomerId = newCust.id;
    }

    const order = saveOrder({
      customerId: assignedCustomerId,
      customerName: name,
      customerPhone: phone,
      customerWhatsapp: whatsapp || phone.replace(/\D/g, ''),
      customerEmail: email,
      customerCpfCnpj: cpfCnpj,
      shippingAddress: {
        zipCode,
        address,
        number,
        complement,
        neighborhood,
        city,
        state,
      },
      items: orderItems,
      discount,
      shipping,
      paymentMethod,
      paymentStatus: paymentMethod === 'pix' ? 'pendente' : 'pago',
      status: paymentMethod === 'pix' ? 'aguardando_pagamento' : 'pagamento_confirmado',
      notes: orderNotes,
    });

    setCreatedOrder(order);
    clearCart();
    setStep(5);

    // Automatically trigger official Order PDF download
    try {
      downloadOrderPDF(order, settings);
    } catch {
      // ignore
    }

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    showToast('success', 'Pedido Realizado com Sucesso!', `PDF baixado! Pedido: ${order.orderNumber}`);
    onOrderSuccess(order);
  };

  const handleCopyPix = () => {
    const pixCode = `00020126580014br.gov.bcb.pix0114${settings.pixKey || '38452910000184'}520400005303986540${total.toFixed(2)}5802BR5925${settings.pixReceiverName || 'M2MBrasil'}6009${settings.pixCity || 'SAO PAULO'}62070503***6304`;
    navigator.clipboard.writeText(pixCode);
    setCopiedPix(true);
    showToast('success', 'Código PIX Copiado!', 'Cole no aplicativo do seu banco.');
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handleSendWhatsAppToCompany = () => {
    if (!createdOrder) return;
    const msg = formatWhatsAppOrderMessage(createdOrder, settings, 'company');
    // Target company number: 5515996019227
    const link = buildWhatsAppLink(settings.whatsapp || '5515996019227', msg);
    window.open(link, '_blank');
  };

  const handleSendWhatsAppToCustomer = () => {
    if (!createdOrder) return;
    const targetPhone = createdOrder.customerWhatsapp || createdOrder.customerPhone || '';
    const cleanNumber = targetPhone.replace(/\D/g, '');
    const fullNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;
    const msg = formatWhatsAppOrderMessage(createdOrder, settings, 'customer');
    const link = buildWhatsAppLink(fullNumber, msg);
    window.open(link, '_blank');
  };

  const handleDownloadPDFAgain = () => {
    if (!createdOrder) return;
    downloadOrderPDF(createdOrder, settings);
    showToast('info', 'Download Iniciado', `Arquivo Pedido-${createdOrder.orderNumber}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between pb-6 border-b border-blue-900/30">
        <button
          onClick={onBackToStore}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a Loja</span>
        </button>
        <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
          Checkout Seguro M2MBrasil
        </span>
      </div>

      {/* Step Indicators */}
      {step < 5 && (
        <div className="py-6">
          <div className="flex items-center justify-between max-w-2xl mx-auto text-xs font-semibold">
            <div
              className={`flex items-center gap-2 ${
                step >= 1 ? 'text-blue-400 font-bold' : 'text-slate-500'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                  step >= 1 ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-400'
                }`}
              >
                1
              </span>
              <span className="hidden sm:inline">Identificação</span>
            </div>
            <div className={`h-0.5 flex-1 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-800'}`} />

            <div
              className={`flex items-center gap-2 ${
                step >= 2 ? 'text-blue-400 font-bold' : 'text-slate-500'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                  step >= 2 ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-400'
                }`}
              >
                2
              </span>
              <span className="hidden sm:inline">Endereço</span>
            </div>
            <div className={`h-0.5 flex-1 mx-2 ${step >= 3 ? 'bg-blue-600' : 'bg-slate-800'}`} />

            <div
              className={`flex items-center gap-2 ${
                step >= 3 ? 'text-blue-400 font-bold' : 'text-slate-500'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                  step >= 3 ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-400'
                }`}
              >
                3
              </span>
              <span className="hidden sm:inline">Revisão</span>
            </div>
            <div className={`h-0.5 flex-1 mx-2 ${step >= 4 ? 'bg-blue-600' : 'bg-slate-800'}`} />

            <div
              className={`flex items-center gap-2 ${
                step >= 4 ? 'text-blue-400 font-bold' : 'text-slate-500'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                  step >= 4 ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-400'
                }`}
              >
                4
              </span>
              <span className="hidden sm:inline">Pagamento</span>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Identificação */}
      {step === 1 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-blue-900/40 space-y-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">1. Dados para o Pedido e Nota</h2>
              <p className="text-xs text-slate-400">Informe quem receberá o pedido e a aprovação de arte.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Nome Completo *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Carlos Eduardo Silveira"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">E-mail para Confirmação *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: carlos@email.com"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">WhatsApp (com DDD) *</label>
              <input
                type="text"
                required
                value={whatsapp}
                onChange={(e) => {
                  setWhatsapp(e.target.value);
                  if (!phone) setPhone(e.target.value);
                }}
                placeholder="Ex: (11) 97123-4567"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">CPF ou CNPJ (Opcional)</label>
              <input
                type="text"
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(e.target.value)}
                placeholder="Ex: 000.000.000-00"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                if (!name || !email || !whatsapp) {
                  showToast('warning', 'Campos Obrigatórios', 'Preencha nome, e-mail e WhatsApp.');
                  return;
                }
                setStep(2);
              }}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-900/40"
            >
              <span>Avançar para Endereço</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Endereço de Entrega */}
      {step === 2 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-blue-900/40 space-y-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">2. Endereço de Entrega</h2>
              <p className="text-xs text-slate-400">Informe onde você deseja receber seus produtos personalizados.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">CEP (Busca Automática) *</label>
              <input
                type="text"
                required
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                onBlur={handleCepBlur}
                placeholder="00000-000"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-300">Endereço (Rua/Avenida) *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: Av. Paulista"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Número *</label>
              <input
                type="text"
                required
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="Ex: 1000"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Complemento (Apto, Sala, Bloco)</label>
              <input
                type="text"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
                placeholder="Ex: Sala 42"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Bairro *</label>
              <input
                type="text"
                required
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Ex: Bela Vista"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Cidade *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: São Paulo"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Estado (UF) *</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Ex: SP"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-3 space-y-1">
              <label className="text-xs font-semibold text-slate-300">Instruções de Entrega (Opcional)</label>
              <input
                type="text"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Ex: Deixar na portaria com o porteiro Silva"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
            >
              Voltar
            </button>
            <button
              onClick={() => {
                if (!address || !number || !neighborhood || !city || !state) {
                  showToast('warning', 'Campos Obrigatórios', 'Preencha o endereço completo.');
                  return;
                }
                setStep(3);
              }}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-900/40"
            >
              <span>Avançar para Revisão</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Revisão do Pedido */}
      {step === 3 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-blue-900/40 space-y-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">3. Revisão do Pedido</h2>
              <p className="text-xs text-slate-400">Verifique os produtos selecionados e suas personalizações.</p>
            </div>
          </div>

          {/* Items Breakdown */}
          <div className="space-y-3 divide-y divide-slate-800">
            {items.map((it) => (
              <div key={it.cartItemId} className="pt-3 first:pt-0 flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.product.images[0]?.url || ''}
                    alt={it.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-white truncate">{it.product.name}</h4>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-400 mt-1">
                    {it.selectedColor && <span>Cor: <strong>{it.selectedColor.name}</strong></span>}
                    {it.selectedSize && <span>Tamanho: <strong>{it.selectedSize.name}</strong></span>}
                    <span>Qtd: <strong>{it.quantity}</strong></span>
                  </div>
                  {it.customization && (it.customization.customText || it.customization.placement) && (
                    <div className="mt-1 text-[11px] text-blue-300 bg-blue-950/60 p-1.5 rounded-lg border border-blue-900/50">
                      {it.customization.customText && <span>Texto: &quot;{it.customization.customText}&quot; • </span>}
                      {it.customization.placement && <span>Posição: {it.customization.placement}</span>}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-bold text-sm text-blue-300">
                    {formatBRL(it.unitPrice * it.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery & Customer Summary */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-white mb-1">Destinatário:</p>
              <p>{name}</p>
              <p>{whatsapp}</p>
              <p>{email}</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-1">Endereço de Entrega:</p>
              <p>{address}, {number} {complement && `(${complement})`}</p>
              <p>{neighborhood} - {city}/{state}</p>
              <p>CEP: {zipCode}</p>
            </div>
          </div>

          {/* Totals */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-800/40 space-y-2 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>Subtotal dos Produtos</span>
              <span className="font-semibold text-white">{formatBRL(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Desconto Aplicado</span>
                <span>- {formatBRL(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Frete</span>
              <span className="font-semibold text-white">
                {shipping === 0 ? <span className="text-emerald-400 font-bold">Grátis</span> : formatBRL(shipping)}
              </span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
              <span>Valor Total</span>
              <span className="text-blue-300 text-xl">{formatBRL(total)}</span>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
            >
              Voltar
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-900/40"
            >
              <span>Avançar para Pagamento</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Forma de Pagamento */}
      {step === 4 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-blue-900/40 space-y-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">4. Forma de Pagamento</h2>
              <p className="text-xs text-slate-400">Escolha como deseja pagar o seu pedido.</p>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('pix')}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                paymentMethod === 'pix'
                  ? 'bg-blue-600/20 border-blue-400 text-white shadow-lg'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <QrCode className="w-6 h-6 text-teal-400" />
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Instantâneo
                </span>
              </div>
              <div>
                <p className="font-bold text-sm text-white">PIX</p>
                <p className="text-[11px] text-slate-400">Chave CNPJ com QR Code imediato</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('cartao')}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                paymentMethod === 'cartao'
                  ? 'bg-blue-600/20 border-blue-400 text-white shadow-lg'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <CreditCard className="w-6 h-6 text-blue-400" />
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Até 12x
                </span>
              </div>
              <div>
                <p className="font-bold text-sm text-white">Cartão de Crédito</p>
                <p className="text-[11px] text-slate-400">Visa, Mastercard, Elo</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('dinheiro')}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                paymentMethod === 'dinheiro'
                  ? 'bg-blue-600/20 border-blue-400 text-white shadow-lg'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <Truck className="w-6 h-6 text-amber-400" />
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Na Entrega
                </span>
              </div>
              <div>
                <p className="font-bold text-sm text-white">Dinheiro / Retirada</p>
                <p className="text-[11px] text-slate-400">Pagamento no balcão ou motoboy</p>
              </div>
            </button>
          </div>

          {/* Conditional Credit Card form */}
          {paymentMethod === 'cartao' && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs animate-in fade-in">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Número do Cartão</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="0000 0000 0000 0000"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Nome no Cartão</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="Como impresso no cartão"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Validade</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/AA"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">CVV</label>
                    <input
                      type="text"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="123"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Parcelamento</label>
                <select
                  value={installments}
                  onChange={(e) => setInstallments(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="1">1x de {formatBRL(total)} (Sem juros)</option>
                  <option value="2">2x de {formatBRL(total / 2)} (Sem juros)</option>
                  <option value="3">3x de {formatBRL(total / 3)} (Sem juros)</option>
                  <option value="4">4x de {formatBRL(total / 4)} (Sem juros)</option>
                </select>
              </div>
            </div>
          )}

          {/* Conditional PIX instructions */}
          {paymentMethod === 'pix' && (
            <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-700/40 text-xs space-y-2 text-teal-200 animate-in fade-in">
              <p className="font-bold text-white flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-teal-400" />
                Chave PIX Oficial M2MBrasil
              </p>
              <p className="text-slate-300">
                Ao clicar em confirmar, o código PIX Copia e Cola será gerado instantaneamente com o valor de{' '}
                <strong>{formatBRL(total)}</strong>.
              </p>
              <div className="p-2 rounded-xl bg-slate-950 border border-teal-900/60 font-mono text-[11px] text-teal-300 flex justify-between items-center">
                <span>CNPJ: {settings.cnpj}</span>
                <span className="text-slate-400">Favorecido: {settings.companyName}</span>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setStep(3)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
            >
              Voltar
            </button>
            <button
              id="confirm-order-finish-btn"
              onClick={handleFinishOrder}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm flex items-center gap-2.5 shadow-xl shadow-emerald-950 border border-emerald-400/40 hover:scale-105 transition-all"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Confirmar & Gerar Pedido ({formatBRL(total)})</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Confirmação Oficial, PDF & Despacho WhatsApp */}
      {step === 5 && createdOrder && (
        <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/95 border border-emerald-500/40 text-center space-y-6 shadow-2xl animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-900/40">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs uppercase font-black px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              ✓ Pedido Registrado & PDF Gerado com Sucesso!
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">
              Número: <span className="text-blue-400">{createdOrder.orderNumber}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl mx-auto">
              Seu pedido foi registrado no sistema. O arquivo <strong>PDF oficial</strong> com layout profissional foi preparado e pode ser enviado diretamente para o WhatsApp da nossa empresa e para o seu celular!
            </p>
          </div>

          {/* Quick PDF & Print Tools */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-blue-900/50 max-w-xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-left">
              <FileText className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Comprovante em PDF do Pedido</p>
                <p className="text-[11px] text-slate-400">Layout A4 vetorial com valores e personalizações</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="btn-download-order-pdf"
                onClick={handleDownloadPDFAgain}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 transition-all shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar PDF</span>
              </button>
              <button
                id="btn-print-order-receipt"
                onClick={() => setOrderToPrint(createdOrder)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1.5 transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>

          {/* WhatsApp Direct Dispatch Card (Company + Customer) */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-950 to-teal-950/30 border border-emerald-500/50 max-w-xl mx-auto text-left space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-emerald-800/40 pb-3">
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-black text-sm text-white">Despacho Automático via WhatsApp</h3>
                <p className="text-[11px] text-emerald-300">Envio direto para a empresa (5515996019227) e cópia para o cliente</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Button 1: Send to Company (5515996019227) */}
              <button
                id="btn-send-whatsapp-company"
                onClick={handleSendWhatsAppToCompany}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 border border-emerald-400/40 transition-all hover:scale-[1.02]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>1. Enviar para WhatsApp da Empresa ((15) 99601-9227)</span>
              </button>

              {/* Button 2: Send Copy to Customer's WhatsApp */}
              <button
                id="btn-send-whatsapp-customer"
                onClick={handleSendWhatsAppToCustomer}
                className="w-full p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-850 text-slate-100 font-extrabold text-xs flex items-center justify-center gap-2 border border-emerald-600/40 transition-all hover:scale-[1.02]"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>2. Receber Cópia no meu WhatsApp</span>
              </button>
            </div>
          </div>

          {/* PIX Payload Box if PIX */}
          {createdOrder.paymentMethod === 'pix' && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-blue-900/50 max-w-xl mx-auto text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-teal-400" />
                  PIX Copia e Cola
                </span>
                <span className="text-xs font-black text-teal-300">
                  {formatBRL(createdOrder.total)}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 break-all select-all">
                {`00020126580014br.gov.bcb.pix0114${settings.pixKey || '38452910000184'}520400005303986540${createdOrder.total.toFixed(2)}5802BR5925${settings.pixReceiverName || 'M2MBrasil'}6009${settings.pixCity || 'SAO PAULO'}62070503***6304`}
              </div>

              <button
                onClick={handleCopyPix}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <Copy className="w-4 h-4" />
                <span>{copiedPix ? 'Código PIX Copiado!' : 'Copiar Código PIX'}</span>
              </button>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-800 max-w-xl mx-auto">
            <button
              onClick={onBackToStore}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-900/40"
            >
              Voltar para a Loja
            </button>
          </div>
        </div>
      )}

      {/* Print Receipt Modal */}
      {orderToPrint && (
        <PrintReceiptModal order={orderToPrint} onClose={() => setOrderToPrint(null)} />
      )}
    </div>
  );
}
