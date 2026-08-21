export type UserRole = 'admin' | 'customer' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Customer {
  id: string;
  userId?: string;
  code: string;
  name: string;
  cpfCnpj?: string;
  phone: string;
  whatsapp: string;
  email: string;
  zipCode: string;
  address: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  notes?: string;
  createdAt: string;
  totalSpent?: number;
  ordersCount?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  active: boolean;
  order: number;
}

export interface Color {
  id: string;
  name: string;
  hex: string;
  active: boolean;
}

export interface Size {
  id: string;
  name: string; // e.g. 'P', 'M', 'G', 'GG', 'G1', 'Infantil', 'Único'
  order: number;
  active: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  colorId: string;
  colorName: string;
  colorHex: string;
  sizeId: string;
  sizeName: string;
  sku: string;
  price: number;
  stock: number;
  available: boolean;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  isPrimary: boolean;
  order: number;
  caption?: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName?: string;
  description: string;
  shortDescription: string;
  price: number;
  promotionalPrice?: number;
  cost: number;
  minQuantity: number;
  stock: number;
  active: boolean;
  featured: boolean;
  isPromotion: boolean;
  images: ProductImage[];
  availableColors: Color[];
  availableSizes: Size[];
  variants: ProductVariant[];
  allowCustomization: boolean;
  customizationLocations?: ('frente' | 'costas' | 'peito_esquerdo' | 'peito_direito' | 'manga_esquerda' | 'manga_direita')[];
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'novo'
  | 'aguardando_pagamento'
  | 'pagamento_confirmado'
  | 'aguardando_arte'
  | 'arte_sendo_criada'
  | 'arte_aguardando_aprovacao'
  | 'arte_aprovada'
  | 'em_producao'
  | 'pronto'
  | 'aguardando_retirada'
  | 'enviado'
  | 'entregue'
  | 'cancelado';

export type PaymentMethod = 'pix' | 'cartao' | 'dinheiro' | 'transferencia' | 'boleto';
export type PaymentStatus = 'pendente' | 'pago' | 'parcial' | 'cancelado' | 'estornado';

export interface CustomizationDetails {
  customText?: string;
  fontFamily?: string;
  textColor?: string;
  placement?: string; // 'Frente', 'Costas', 'Peito Esquerdo', etc.
  artFileUrl?: string;
  artFileName?: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  orderId?: string;
  productId: string;
  productName: string;
  productImage: string;
  colorName?: string;
  colorHex?: string;
  sizeName?: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  customization?: CustomizationDetails;
  customizationNotes?: string;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  date: string;
  note?: string;
  user?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // PED-000001
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerWhatsapp: string;
  customerEmail: string;
  customerCpfCnpj?: string;
  shippingAddress: {
    zipCode: string;
    address: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  notes?: string;
  internalNotes?: string;
  timeline: OrderTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export type QuoteStatus = 'novo' | 'enviado' | 'visualizado' | 'aprovado' | 'recusado' | 'convertido';

export interface QuoteItem {
  id: string;
  quoteId?: string;
  productId: string;
  productName: string;
  productImage: string;
  colorName?: string;
  colorHex?: string;
  sizeName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  total?: number;
  customization?: CustomizationDetails;
  customizationNotes?: string;
}

export interface Quote {
  id: string;
  quoteNumber: string; // ORC-000001
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerWhatsapp: string;
  customerEmail: string;
  customerCompany?: string;
  items: QuoteItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: QuoteStatus;
  notes?: string;
  expiresAt: string;
  createdAt: string;
  convertedOrderId?: string;
}

export interface CompanySettings {
  id: string;
  companyName: string;
  tradeName: string;
  cnpj: string;
  logoUrl: string;
  phone: string;
  whatsapp: string;
  whatsappCountryCode: string;
  whatsappAreaCode: string;
  whatsappNumber: string;
  whatsappDefaultMessage: string;
  email: string;
  instagram: string;
  facebook?: string;
  address: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  deliveryFeeDefault: number;
  minOrderValueForFreeShipping?: number;
  freeShippingMinimum?: number;
  freeShippingEnabled: boolean;

  pixKeyType?: 'cnpj' | 'cpf' | 'email' | 'phone' | 'celular' | 'random' | 'aleatoria' | string;
  pixKey?: string;
  pixReceiverName?: string;
  pixCity?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  targetType: 'order' | 'quote' | 'product' | 'customer' | 'settings' | 'auth';
  targetId?: string;
  timestamp: string;
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  selectedColor?: Color;
  selectedSize?: Size;
  quantity: number;
  unitPrice: number;
  customization?: CustomizationDetails;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  active: boolean;
  expiresAt?: string;
  createdAt: string;
}

