'use client';

import React, { useState } from 'react';
import { X, FileText, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { getCompanySettings, getProducts, saveQuote } from '@/lib/storage';
import { formatBRL, buildWhatsAppLink } from '@/lib/formatters';
import { Product } from '@/lib/types';

interface QuickQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedProduct?: Product | null;
}

export function QuickQuoteModal({ isOpen, onClose, preSelectedProduct }: QuickQuoteModalProps) {
  const { customer, user } = useAuth();
  const { showToast } = useNotification();
  const settings = getCompanySettings();
  const products = getProducts().filter((p) => p.active);

  const [name, setName] = useState(customer?.name || user?.name || '');
  const [email, setEmail] = useState(customer?.email || user?.email || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [selectedProductId, setSelectedProductId] = useState<string>(
    preSelectedProduct?.id || products[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(30);
  const [customDetails, setCustomDetails] = useState('');
  const [submittedQuoteNumber, setSubmittedQuoteNumber] = useState<string | null>(null);

  const product = products.find((p) => p.id === selectedProductId) || products[0];
  const unitPrice = product ? (product.promotionalPrice || product.price) : 0;
  const estimatedSubtotal = unitPrice * quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      showToast('warning', 'Campos Obrigatórios', 'Nome e WhatsApp são obrigatórios.');
      return;
    }

    const newQuote = saveQuote({
      customerId: customer?.id || 'cust-anon',
      customerName: name,
      customerPhone: phone,
      customerWhatsapp: phone.replace(/\D/g, ''),
      customerEmail: email || 'cliente@orcamento.com',
      items: [
        {
          id: `qit-${product.id}-${quantity}`,
          productId: product.id,
          productName: product.name,
          productImage: product.images[0]?.url || '',
          quantity,
          unitPrice,
          subtotal: estimatedSubtotal,
          customization: {
            notes: customDetails,
          },
        },
      ],
      notes: `Solicitação rápida pelo site. ${customDetails}`,
    });

    setSubmittedQuoteNumber(newQuote.quoteNumber);
    showToast('success', 'Orçamento Solicitado!', `Orçamento ${newQuote.quoteNumber} gerado com sucesso.`);
  };

  const handleWhatsAppQuote = () => {
    const msg = `Olá, M2MBrasil!\n\nGostaria de solicitar um orçamento para:\n*Produto:* ${product?.name}\n*Quantidade:* ${quantity} peças\n*Nome:* ${name}\n*Detalhes:* ${customDetails || 'A definir'}`;
    const link = buildWhatsAppLink(settings.whatsapp, msg);
    window.open(link, '_blank');
    onClose();
  };

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border border-blue-800/40 rounded-3xl shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-blue-900/30 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Solicitar Orçamento Personalizado</h3>
              <p className="text-[11px] text-slate-400">Atendimento ágil para empresas e eventos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {submittedQuoteNumber ? (
          <div className="p-6 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-black text-lg text-white">Orçamento {submittedQuoteNumber} Registrado!</h4>
              <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                Nossa equipe comercial responderá com a proposta detalhada e amostra virtual.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={handleWhatsAppQuote}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar pelo WhatsApp Agora</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Produto de Interesse</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (A partir de {formatBRL(p.promotionalPrice || p.price)})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Quantidade Estimada</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Estimativa Inicial</label>
                <div className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-blue-300 font-bold flex items-center">
                  {formatBRL(estimatedSubtotal)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Seu Nome *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Ana Paula Rocha"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">WhatsApp (com DDD) *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">E-mail (Opcional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@empresa.com.br"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Detalhes da Personalização (Cores, Posição, Logo)</label>
              <textarea
                value={customDetails}
                onChange={(e) => setCustomDetails(e.target.value)}
                rows={2}
                placeholder="Ex: Quero 20 camisetas pretas e 10 brancas com logo da empresa no peito esquerdo e site nas costas."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-900/40"
              >
                Gerar Proposta no Sistema
              </button>
              <button
                type="button"
                onClick={handleWhatsAppQuote}
                className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950"
              >
                <Send className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
