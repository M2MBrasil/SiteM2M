import { jsPDF } from 'jspdf';
import { CompanySettings, Order } from './types';
import { formatBRL, formatDateBR, ORDER_STATUS_MAP } from './formatters';

/**
 * Generates a clean, professional vector PDF document for an Order
 */
export function generateOrderPDF(order: Order, settings: CompanySettings): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 14;

  // Primary Colors (Blue / Navy / Slate)
  const primaryColor = [30, 58, 138]; // #1e3a8a
  const secondaryColor = [15, 23, 42]; // #0f172a
  const grayColor = [100, 116, 139]; // #64748b
  const lightBgColor = [248, 250, 252]; // #f8fafc

  // Header Banner Background
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, y, contentWidth, 24, 'F');

  // Company Name & Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(settings.companyName || 'M2MBrasil Personalizados', margin + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(
    `CNPJ: ${settings.cnpj}  |  WhatsApp: ${settings.phone || '(15) 99601-9227'}  |  ${settings.email || 'contato@m2mbrasil.com.br'}`,
    margin + 6,
    y + 16
  );
  doc.text(
    `${settings.address || 'Av. Paulista, 1000'}, ${settings.number || '1000'} - ${settings.city || 'São Paulo'}/${settings.state || 'SP'} - CEP: ${settings.zipCode || '01310-100'}`,
    margin + 6,
    y + 21
  );

  y += 30;

  // Order Details Header Bar
  doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`COMPROVANTE OFICIAL DO PEDIDO: ${order.orderNumber}`, margin + 5, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text(`Data: ${formatDateBR(order.createdAt)}`, margin + 5, y + 13);
  
  const statusLabel = ORDER_STATUS_MAP[order.status]?.label || order.status;
  doc.text(`Status: ${statusLabel.toUpperCase()}`, margin + 60, y + 13);
  doc.text(`Pagamento: ${order.paymentMethod.toUpperCase()}`, margin + 120, y + 13);

  y += 24;

  // Customer and Delivery Section (2 Columns Box)
  const boxHeight = 32;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, 'D');

  // Col 1: Customer
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('DADOS DO CLIENTE', margin + 5, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`Nome: ${order.customerName}`, margin + 5, y + 12);
  doc.text(`WhatsApp: ${order.customerPhone || 'Não informado'}`, margin + 5, y + 17);
  doc.text(`E-mail: ${order.customerEmail || 'Não informado'}`, margin + 5, y + 22);
  if (order.customerCpfCnpj) {
    doc.text(`CPF/CNPJ: ${order.customerCpfCnpj}`, margin + 5, y + 27);
  }

  // Col 2: Shipping Address
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('ENDEREÇO DE ENTREGA', margin + contentWidth / 2 + 2, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  const addr = order.shippingAddress;
  if (addr) {
    doc.text(`Rua: ${addr.address || '-'}, Nº ${addr.number || 'S/N'} ${addr.complement ? `(${addr.complement})` : ''}`, margin + contentWidth / 2 + 2, y + 12);
    doc.text(`Bairro: ${addr.neighborhood || '-'}`, margin + contentWidth / 2 + 2, y + 17);
    doc.text(`Cidade/UF: ${addr.city || '-'}/${addr.state || '-'}`, margin + contentWidth / 2 + 2, y + 22);
    doc.text(`CEP: ${addr.zipCode || '-'}`, margin + contentWidth / 2 + 2, y + 27);
  } else {
    doc.text('Retirada na Loja / A Combinar', margin + contentWidth / 2 + 2, y + 12);
  }

  y += boxHeight + 6;

  // Items Table Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('ITEM / PRODUTO & PERSONALIZAÇÃO', margin + 4, y + 5);
  doc.text('QTD', margin + 115, y + 5);
  doc.text('UNITÁRIO', margin + 135, y + 5);
  doc.text('TOTAL', margin + 162, y + 5);

  y += 7;

  // Items Rows
  order.items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    if (isEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 14, 'F');
    }
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + 14, margin + contentWidth, y + 14);

    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`${index + 1}. ${item.productName}`, margin + 4, y + 5);

    // Customization details line
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    const details = [];
    if (item.colorName) details.push(`Cor: ${item.colorName}`);
    if (item.sizeName) details.push(`Tam: ${item.sizeName}`);
    if (item.customization?.placement) details.push(`Posição: ${item.customization.placement}`);
    if (item.customization?.textColor) details.push(`Cor da Gravação: ${item.customization.textColor}`);
    if (item.customization?.customText) details.push(`Texto: "${item.customization.customText}"`);
    
    const detailsStr = details.join(' | ') || 'Sem personalização adicional';
    doc.text(detailsStr.slice(0, 75), margin + 4, y + 10);

    // Numbers
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(`${item.quantity} un`, margin + 115, y + 6);
    doc.text(formatBRL(item.unitPrice), margin + 135, y + 6);
    doc.text(formatBRL(item.subtotal), margin + 162, y + 6);

    y += 14;
  });

  y += 4;

  // Order Notes if present
  if (order.notes) {
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(251, 191, 36);
    doc.roundedRect(margin, y, contentWidth, 12, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(146, 64, 14);
    doc.text('OBSERVAÇÕES DO CLIENTE / PRODUÇÃO:', margin + 4, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.text(order.notes.slice(0, 120), margin + 4, y + 9);
    y += 16;
  }

  // Totals & PIX Box Section
  const totalsBoxHeight = 36;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, totalsBoxHeight, 2, 2, 'FD');

  // Left side of Totals Box: PIX Payment Instructions
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('DADOS PARA PAGAMENTO VIA PIX:', margin + 5, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`Chave PIX (${(settings.pixKeyType || 'CNPJ').toUpperCase()}): ${settings.pixKey || '38.452.910/0001-84'}`, margin + 5, y + 13);
  doc.text(`Favorecido: ${settings.pixReceiverName || 'M2MBrasil Personalizados'}`, margin + 5, y + 18);
  doc.text(`WhatsApp de Envio do Comprovante: ${settings.phone || '(15) 99601-9227'}`, margin + 5, y + 23);
  doc.text('Envie o comprovante no WhatsApp da empresa para iniciar a produção.', margin + 5, y + 28);

  // Right side of Totals Box: Financial Values
  const rightColX = margin + 115;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Subtotal:', rightColX, y + 8);
  doc.text(formatBRL(order.subtotal), margin + 162, y + 8);

  if (order.discount > 0) {
    doc.setTextColor(220, 38, 38);
    doc.text('Desconto:', rightColX, y + 14);
    doc.text(`- ${formatBRL(order.discount)}`, margin + 162, y + 14);
  }

  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Frete:', rightColX, y + 20);
  doc.text(order.shipping === 0 ? 'GRÁTIS' : formatBRL(order.shipping), margin + 162, y + 20);

  // Total Line
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(rightColX - 2, y + 24, contentWidth - (rightColX - margin) + 2, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL A PAGAR:', rightColX + 2, y + 30);
  doc.text(formatBRL(order.total), margin + 158, y + 30);

  y += totalsBoxHeight + 8;

  // Footer note
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text(
    'M2MBrasil - Camisetas Dry Fit, Moletons, Bonés Trucker, Canecas e Uniformes Empresariais de Alta Precisão.',
    margin + contentWidth / 2,
    y + 4,
    { align: 'center' }
  );

  return doc;
}

/**
 * Generates and triggers automatic download of the order PDF
 */
export function downloadOrderPDF(order: Order, settings: CompanySettings): void {
  const doc = generateOrderPDF(order, settings);
  doc.save(`Pedido-${order.orderNumber}.pdf`);
}

/**
 * Builds formatted text for WhatsApp dispatching
 */
export function formatWhatsAppOrderMessage(
  order: Order,
  settings: CompanySettings,
  target: 'company' | 'customer' = 'company'
): string {
  const itemsText = order.items
    .map((item, idx) => {
      const custom = item.customization;
      const details = [];
      if (custom?.textColor) details.push(`Cor do Texto: ${custom.textColor}`);
      if (custom?.placement) details.push(`Posição: ${custom.placement}`);
      if (custom?.customText) details.push(`Frase: "${custom.customText}"`);
      const detailsStr = details.length > 0 ? ` (${details.join(', ')})` : '';
      return `${idx + 1}️⃣ *${item.quantity}x ${item.productName}*${detailsStr} - ${formatBRL(item.subtotal)}`;
    })
    .join('\n');

  const addr = order.shippingAddress;
  const addressText = addr
    ? `${addr.address}, ${addr.number}${addr.complement ? ` - ${addr.complement}` : ''}, ${addr.neighborhood}, ${addr.city}/${addr.state} - CEP ${addr.zipCode}`
    : 'Retirada na Loja / A combinar';

  if (target === 'company') {
    return (
      `🚨 *NOVO PEDIDO RECEBIDO NO SITE - M2MBRASIL*\n\n` +
      `📦 *Pedido:* #${order.orderNumber}\n` +
      `📅 *Data:* ${formatDateBR(order.createdAt)}\n\n` +
      `👤 *DADOS DO CLIENTE:*\n` +
      `• *Nome:* ${order.customerName}\n` +
      `• *WhatsApp:* ${order.customerPhone || 'Não informado'}\n` +
      `• *E-mail:* ${order.customerEmail || 'Não informado'}\n` +
      (order.customerCpfCnpj ? `• *CPF/CNPJ:* ${order.customerCpfCnpj}\n` : '') +
      `• *Endereço de Entrega:* ${addressText}\n\n` +
      `🛍️ *ITENS DO PEDIDO:*\n${itemsText}\n\n` +
      `💰 *RESUMO FINANCEIRO:*\n` +
      `• *Subtotal:* ${formatBRL(order.subtotal)}\n` +
      (order.discount > 0 ? `• *Desconto:* -${formatBRL(order.discount)}\n` : '') +
      `• *Frete:* ${order.shipping === 0 ? 'Grátis' : formatBRL(order.shipping)}\n` +
      `• *TOTAL GERAL:* *${formatBRL(order.total)}*\n` +
      `• *Forma de Pagamento:* ${order.paymentMethod.toUpperCase()}\n\n` +
      (order.notes ? `📝 *Observações do Cliente:* ${order.notes}\n\n` : '') +
      `📄 *Comprovante em PDF:* Gerado pelo cliente e pronto para conferência.\n` +
      `Por favor, confirmem o recebimento do pedido e o início da produção!`
    );
  } else {
    return (
      `✅ *CONFIRMAÇÃO DO SEU PEDIDO - M2MBRASIL*\n\n` +
      `Olá, *${order.customerName}*! Seu pedido *#${order.orderNumber}* foi registrado com sucesso em nosso sistema.\n\n` +
      `🛍️ *Resumo dos Itens:*\n${itemsText}\n\n` +
      `💰 *Total a Pagar:* *${formatBRL(order.total)}*\n` +
      `📍 *Entrega:* ${addressText}\n\n` +
      `🔑 *CHAVE PIX PARA PAGAMENTO:*\n` +
      `• Tipo: ${(settings.pixKeyType || 'CNPJ').toUpperCase()}\n` +
      `• Chave: *${settings.pixKey || '38452910000184'}*\n` +
      `• Favorecido: ${settings.pixReceiverName || 'M2MBrasil Personalizados'}\n\n` +
      `📲 Envie o comprovante respondendo esta mensagem ou pelo WhatsApp oficial: *${settings.phone || '(15) 99601-9227'}*.\n\n` +
      `Muito obrigado pela confiança!`
    );
  }
}
