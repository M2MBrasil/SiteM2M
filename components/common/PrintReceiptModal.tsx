'use client';

import React from 'react';
import { X, Printer, CheckCircle2 } from 'lucide-react';
import { Order } from '@/lib/types';
import { formatBRL, formatDateBR, ORDER_STATUS_MAP, PAYMENT_METHOD_MAP } from '@/lib/formatters';
import { getCompanySettings } from '@/lib/storage';

interface PrintReceiptModalProps {
  order: Order;
  onClose: () => void;
}

export function PrintReceiptModal({ order, onClose }: PrintReceiptModalProps) {
  const settings = getCompanySettings();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden print:m-0 print:p-0 print:shadow-none print:w-full print:max-w-none">
        {/* Action Header (hidden in print) */}
        <div className="p-4 bg-slate-950 text-white flex items-center justify-between print:hidden">
          <span className="font-bold text-sm">Comprovante de Pedido / Ordem de Produção</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 space-y-6 text-xs text-slate-800" id="printable-order-receipt">
          {/* Company Header */}
          <div className="flex justify-between items-start border-b pb-4">
            <div className="flex items-center gap-3">
              {settings.logoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={settings.logoUrl}
                  alt={settings.companyName || 'Logotipo'}
                  className="max-h-12 max-w-[120px] object-contain"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                  M2M
                </div>
              )}
              <div>
                <h1 className="text-xl font-black text-slate-900">{settings.companyName}</h1>
                <p className="text-[11px] text-slate-600">CNPJ: {settings.cnpj}</p>
                <p className="text-[11px] text-slate-600">
                  {settings.address}, {settings.number} - {settings.city}/{settings.state}
                </p>
                <p className="text-[11px] text-slate-600">WhatsApp: {settings.phone} • {settings.email}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-100 border rounded font-mono font-bold text-sm text-slate-900">
                {order.orderNumber}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">Data: {formatDateBR(order.createdAt)}</p>
              <p className="text-[11px] font-semibold text-blue-800">
                Status: {ORDER_STATUS_MAP[order.status]?.label || order.status}
              </p>
            </div>
          </div>

          {/* Customer & Delivery Data */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border text-[11px]">
            <div>
              <p className="font-bold text-slate-900 mb-1">DADOS DO CLIENTE:</p>
              <p><strong>Nome:</strong> {order.customerName}</p>
              <p><strong>WhatsApp:</strong> {order.customerWhatsapp || order.customerPhone}</p>
              <p><strong>E-mail:</strong> {order.customerEmail}</p>
              {order.customerCpfCnpj && <p><strong>CPF/CNPJ:</strong> {order.customerCpfCnpj}</p>}
            </div>
            <div>
              <p className="font-bold text-slate-900 mb-1">ENDEREÇO DE ENTREGA:</p>
              <p>{order.shippingAddress?.address}, {order.shippingAddress?.number} {order.shippingAddress?.complement ? `(${order.shippingAddress.complement})` : ''}</p>
              <p>{order.shippingAddress?.neighborhood} - {order.shippingAddress?.city}/{order.shippingAddress?.state}</p>
              <p>CEP: {order.shippingAddress?.zipCode}</p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <p className="font-bold text-slate-900 mb-2">ITENS DO PEDIDO & PERSONALIZAÇÃO:</p>
            <table className="w-full border-collapse border text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-900">
                  <th className="border p-2 text-left">Item / Descrição</th>
                  <th className="border p-2 text-center">Cor / Tam</th>
                  <th className="border p-2 text-center">Qtd</th>
                  <th className="border p-2 text-right">Unitário</th>
                  <th className="border p-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="border p-2">
                      <p className="font-bold text-slate-900">{it.productName}</p>
                      {it.customization && (
                        <div className="text-[10px] text-slate-600 mt-1 bg-slate-50 p-1.5 rounded">
                          {it.customization.customText && (
                            <p><strong>Texto:</strong> {it.customization.customText}</p>
                          )}
                          {it.customization.placement && (
                            <p><strong>Posição:</strong> {it.customization.placement}</p>
                          )}
                          {it.customization.notes && (
                            <p><strong>Obs:</strong> {it.customization.notes}</p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="border p-2 text-center">
                      {it.colorName || '-'} / {it.sizeName || '-'}
                    </td>
                    <td className="border p-2 text-center font-bold">{it.quantity}</td>
                    <td className="border p-2 text-right">{formatBRL(it.unitPrice)}</td>
                    <td className="border p-2 text-right font-bold">{formatBRL(it.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes & Totals */}
          <div className="grid grid-cols-2 gap-4 items-start pt-2">
            <div>
              {order.notes && (
                <div className="p-2.5 bg-slate-50 border rounded text-[11px]">
                  <p className="font-bold text-slate-900">Observações do Cliente:</p>
                  <p className="text-slate-600 mt-0.5">{order.notes}</p>
                </div>
              )}
              <div className="mt-2 text-[11px] text-slate-600">
                <p><strong>Forma de Pagamento:</strong> {PAYMENT_METHOD_MAP[order.paymentMethod] || order.paymentMethod}</p>
                <p><strong>Status do Pagamento:</strong> {order.paymentStatus.toUpperCase()}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border rounded space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatBRL(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Desconto:</span>
                  <span>- {formatBRL(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Frete:</span>
                <span>{formatBRL(order.shipping)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t">
                <span>TOTAL:</span>
                <span>{formatBRL(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Signature lines */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-[10px] text-slate-500 border-t">
            <div>
              <div className="border-b border-slate-400 w-48 mx-auto mb-1" />
              <p>M2MBrasil Produção</p>
            </div>
            <div>
              <div className="border-b border-slate-400 w-48 mx-auto mb-1" />
              <p>Assinatura do Cliente / Recebedor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
