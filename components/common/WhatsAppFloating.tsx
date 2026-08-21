'use client';

import React, { useState } from 'react';
import { MessageCircle, X, Send, Sparkles, HelpCircle } from 'lucide-react';
import { getCompanySettings } from '@/lib/storage';
import { buildWhatsAppLink } from '@/lib/formatters';

export function WhatsAppFloating() {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');
  const settings = getCompanySettings();

  const handleSend = (text?: string) => {
    const messageToSend = text || customMsg || settings.whatsappDefaultMessage;
    const link = buildWhatsAppLink(settings.whatsapp, messageToSend);
    window.open(link, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Popover popup */}
      {isOpen && (
        <div
          id="whatsapp-chat-popover"
          className="mb-3 w-80 sm:w-88 bg-slate-900 border border-blue-600/40 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-slate-950 border border-blue-300/40 flex items-center justify-center font-bold text-blue-300 text-sm">
                  M2M
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">Atendimento M2MBrasil</p>
                <p className="text-[11px] text-blue-200 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online no WhatsApp
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-blue-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick choices body */}
          <div className="p-4 space-y-3 bg-slate-950/80 text-xs">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-slate-300">
              <p className="font-medium text-white mb-1">Olá! Como podemos te ajudar hoje?</p>
              <p className="text-[11px] text-slate-400">
                Escolha uma opção rápida abaixo ou envie uma mensagem personalizada:
              </p>
            </div>

            <div className="space-y-1.5">
              <button
                onClick={() =>
                  handleSend(
                    'Olá, M2MBrasil! Gostaria de solicitar um orçamento para camisetas/moletons personalizados.'
                  )
                }
                className="w-full text-left p-2 rounded-lg bg-slate-900 hover:bg-blue-950 border border-slate-800 hover:border-blue-700/50 text-blue-300 transition-colors flex items-center justify-between"
              >
                <span>Pedir Orçamento com Minha Arte</span>
                <Send className="w-3 h-3 text-blue-400 shrink-0" />
              </button>

              <button
                onClick={() =>
                  handleSend('Olá! Gostaria de consultar o status e prazo de entrega do meu pedido.')
                }
                className="w-full text-left p-2 rounded-lg bg-slate-900 hover:bg-blue-950 border border-slate-800 hover:border-blue-700/50 text-slate-300 transition-colors flex items-center justify-between"
              >
                <span>Consultar Status de Pedido</span>
                <HelpCircle className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              <button
                onClick={() =>
                  handleSend(
                    'Olá! Gostaria de saber os tipos de tecidos e acabamentos disponíveis (Dry Fit, Piquet, Algodão).'
                  )
                }
                className="w-full text-left p-2 rounded-lg bg-slate-900 hover:bg-blue-950 border border-slate-800 hover:border-blue-700/50 text-slate-300 transition-colors flex items-center justify-between"
              >
                <span>Dúvidas sobre Tecidos & Estampas</span>
                <Sparkles className="w-3 h-3 text-yellow-400 shrink-0" />
              </button>
            </div>

            {/* Custom Input */}
            <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
                placeholder="Escreva sua mensagem..."
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={() => handleSend()}
                className="p-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md transition-all shrink-0"
                aria-label="Enviar WhatsApp"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        id="floating-whatsapp-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-full shadow-2xl shadow-emerald-900/60 hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-emerald-400/40"
        aria-label="Falar no WhatsApp"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
        </span>
        <MessageCircle className="w-5 h-5 fill-white/20" />
        <span className="font-bold text-xs tracking-wide pr-1">Falar no WhatsApp</span>
      </button>
    </div>
  );
}
