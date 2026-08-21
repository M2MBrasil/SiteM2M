import { OrderStatus, PaymentMethod, PaymentStatus, QuoteStatus } from './types';

export function formatBRL(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDateBR(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateOnlyBR(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatPhone(phone: string | undefined | null): string {
  if (!phone) return '';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
  }
  if (clean.length === 10) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  }
  return phone;
}

export function formatCPFCNPJ(value: string | undefined | null): string {
  if (!value) return '';
  const clean = value.replace(/\D/g, '');
  if (clean.length === 11) {
    return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`;
  }
  if (clean.length === 14) {
    return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12)}`;
  }
  return value;
}

export function formatCEP(value: string | undefined | null): string {
  if (!value) return '';
  const clean = value.replace(/\D/g, '');
  if (clean.length === 8) {
    return `${clean.slice(0, 5)}-${clean.slice(5)}`;
  }
  return value;
}

export const ORDER_STATUS_MAP: Record<OrderStatus, { label: string; bg: string; text: string; step: number }> = {
  novo: { label: 'Novo Pedido', bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-600 dark:text-blue-400', step: 1 },
  aguardando_pagamento: { label: 'Aguardando Pagamento', bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-600 dark:text-amber-400', step: 1 },
  pagamento_confirmado: { label: 'Pagamento Confirmado', bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-600 dark:text-emerald-400', step: 2 },
  aguardando_arte: { label: 'Aguardando Arte', bg: 'bg-indigo-500/10 border-indigo-500/30', text: 'text-indigo-600 dark:text-indigo-400', step: 3 },
  arte_sendo_criada: { label: 'Arte sendo Criada', bg: 'bg-purple-500/10 border-purple-500/30', text: 'text-purple-600 dark:text-purple-400', step: 3 },
  arte_aguardando_aprovacao: { label: 'Arte Aguardando Aprovação', bg: 'bg-yellow-500/10 border-yellow-500/30', text: 'text-yellow-700 dark:text-yellow-400', step: 4 },
  arte_aprovada: { label: 'Arte Aprovada', bg: 'bg-cyan-500/10 border-cyan-500/30', text: 'text-cyan-700 dark:text-cyan-400', step: 4 },
  em_producao: { label: 'Em Produção', bg: 'bg-blue-600/10 border-blue-600/30', text: 'text-blue-700 dark:text-blue-300', step: 5 },
  pronto: { label: 'Pronto / Finalizado', bg: 'bg-teal-500/10 border-teal-500/30', text: 'text-teal-700 dark:text-teal-300', step: 6 },
  aguardando_retirada: { label: 'Aguardando Retirada', bg: 'bg-sky-500/10 border-sky-500/30', text: 'text-sky-700 dark:text-sky-300', step: 6 },
  enviado: { label: 'Enviado / Em Trânsito', bg: 'bg-blue-700/10 border-blue-700/30', text: 'text-blue-800 dark:text-blue-300', step: 7 },
  entregue: { label: 'Entregue', bg: 'bg-green-600/15 border-green-600/30', text: 'text-green-700 dark:text-green-300', step: 8 },
  cancelado: { label: 'Cancelado', bg: 'bg-rose-500/10 border-rose-500/30', text: 'text-rose-600 dark:text-rose-400', step: 0 },
};

export const ORDER_STATUS_STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'novo', label: 'Novo Pedido' },
  { status: 'aguardando_pagamento', label: 'Aguardando Pagamento' },
  { status: 'pagamento_confirmado', label: 'Pagamento Confirmado' },
  { status: 'aguardando_arte', label: 'Aguardando Arte' },
  { status: 'arte_sendo_criada', label: 'Arte sendo Criada' },
  { status: 'arte_aguardando_aprovacao', label: 'Arte Aguardando Aprovação' },
  { status: 'arte_aprovada', label: 'Arte Aprovada' },
  { status: 'em_producao', label: 'Em Produção' },
  { status: 'pronto', label: 'Pronto / Finalizado' },
  { status: 'aguardando_retirada', label: 'Aguardando Retirada' },
  { status: 'enviado', label: 'Enviado / Em Trânsito' },
  { status: 'entregue', label: 'Entregue' },
  { status: 'cancelado', label: 'Cancelado' },
];



export const QUOTE_STATUS_MAP: Record<QuoteStatus, { label: string; bg: string; text: string }> = {
  novo: { label: 'Novo Orçamento', bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-600 dark:text-blue-400' },
  enviado: { label: 'Enviado ao Cliente', bg: 'bg-indigo-500/10 border-indigo-500/30', text: 'text-indigo-600 dark:text-indigo-400' },
  visualizado: { label: 'Visualizado', bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-600 dark:text-amber-400' },
  aprovado: { label: 'Aprovado pelo Cliente', bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-600 dark:text-emerald-400' },
  recusado: { label: 'Recusado', bg: 'bg-rose-500/10 border-rose-500/30', text: 'text-rose-600 dark:text-rose-400' },
  convertido: { label: 'Convertido em Pedido', bg: 'bg-teal-500/10 border-teal-500/30', text: 'text-teal-700 dark:text-teal-300' },
};

export const PAYMENT_METHOD_MAP: Record<PaymentMethod, string> = {
  pix: 'PIX (Chave Oficial)',
  cartao: 'Cartão de Crédito / Débito',
  dinheiro: 'Dinheiro na Retirada / Entrega',
  transferencia: 'Transferência Bancária / TED',
  boleto: 'Boleto Bancário',
};

export const PAYMENT_STATUS_MAP: Record<PaymentStatus, { label: string; bg: string; text: string }> = {
  pendente: { label: 'Pendente', bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-700 dark:text-amber-400' },
  pago: { label: 'Pago', bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-700 dark:text-emerald-400' },
  parcial: { label: 'Parcial (50%)', bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-700 dark:text-blue-400' },
  cancelado: { label: 'Cancelado', bg: 'bg-rose-500/10 border-rose-500/30', text: 'text-rose-700 dark:text-rose-400' },
  estornado: { label: 'Estornado', bg: 'bg-zinc-500/10 border-zinc-500/30', text: 'text-zinc-700 dark:text-zinc-400' },
};

export function buildWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const finalPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  return `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
}
