import {
  ActivityLog,
  Category,
  Color,
  CompanySettings,
  Coupon,
  Customer,
  Order,
  OrderStatus,
  Product,
  Quote,
  QuoteStatus,
  Size,
  User,
} from './types';

import {
  INITIAL_CATEGORIES,
  INITIAL_COLORS,
  INITIAL_CUSTOMERS,
  INITIAL_LOGS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_QUOTES,
  INITIAL_SETTINGS,
  INITIAL_SIZES,
  INITIAL_USERS,
} from './initialData';

export interface AppDatabase {
  products: Product[];
  categories: Category[];
  customers: Customer[];
  orders: Order[];
  quotes: Quote[];
  settings: CompanySettings;
  colors: Color[];
  sizes: Size[];
  users: User[];
  logs: ActivityLog[];
  coupons: Coupon[];
}

const STORAGE_KEY = 'm2m_brasil_db_v1';

// In-memory runtime state
let currentDb: AppDatabase | null = null;
const listeners: Array<() => void> = [];

export function getInitialDatabase(): AppDatabase {
  return {
    products: INITIAL_PRODUCTS,
    categories: INITIAL_CATEGORIES,
    customers: INITIAL_CUSTOMERS,
    orders: INITIAL_ORDERS,
    quotes: INITIAL_QUOTES,
    settings: INITIAL_SETTINGS,
    colors: INITIAL_COLORS,
    sizes: INITIAL_SIZES,
    users: INITIAL_USERS,
    logs: INITIAL_LOGS,
    coupons: [
      {
        id: 'cp-1',
        code: 'PRIMEIRACOMPRA',
        discountType: 'percentage',
        discountValue: 10,
        minOrderValue: 100,
        usageCount: 14,
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'cp-2',
        code: 'M2M20',
        discountType: 'percentage',
        discountValue: 20,
        minOrderValue: 250,
        usageCount: 8,
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'cp-3',
        code: 'FRETEGRATIS',
        discountType: 'fixed',
        discountValue: 25,
        minOrderValue: 200,
        usageCount: 31,
        active: true,
        createdAt: new Date().toISOString(),
      },
    ],
  };
}


export function subscribeDb(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

function notifyListeners() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error('Error notifying db subscriber', e);
    }
  });
}

export function getDb(): AppDatabase {
  if (typeof window === 'undefined') {
    if (!currentDb) currentDb = getInitialDatabase();
    return currentDb;
  }

  if (currentDb) return currentDb;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const initial = getInitialDatabase();
      const currentSettings = parsed.settings || INITIAL_SETTINGS;
      if (!currentSettings.whatsapp || currentSettings.whatsapp === '11987654321') {
        currentSettings.whatsapp = '5515996019227';
        currentSettings.phone = '(15) 99601-9227';
        currentSettings.whatsappAreaCode = '15';
        currentSettings.whatsappNumber = '996019227';
      }
      currentDb = {
        products: parsed.products || INITIAL_PRODUCTS,
        categories: parsed.categories || INITIAL_CATEGORIES,
        customers: parsed.customers || INITIAL_CUSTOMERS,
        orders: parsed.orders || INITIAL_ORDERS,
        quotes: parsed.quotes || INITIAL_QUOTES,
        settings: currentSettings,
        colors: parsed.colors || INITIAL_COLORS,
        sizes: parsed.sizes || INITIAL_SIZES,
        users: parsed.users || INITIAL_USERS,
        logs: parsed.logs || INITIAL_LOGS,
        coupons: parsed.coupons || initial.coupons,
      };

      return currentDb;
    }
  } catch (err) {
    console.warn('Failed to parse database from localStorage', err);
  }

  currentDb = getInitialDatabase();
  saveDb(currentDb);
  return currentDb;
}

export function saveDb(db: AppDatabase): void {
  currentDb = db;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.error('Failed to save db to localStorage', e);
    }
  }
  notifyListeners();
}

// Log administrative action
export function addActivityLog(
  action: string,
  details: string,
  targetType: ActivityLog['targetType'],
  targetId?: string,
  userName = 'Administrador',
  userId = 'usr-admin-1'
) {
  const db = getDb();
  const newLog: ActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    userId,
    userName,
    action,
    details,
    targetType,
    targetId,
    timestamp: new Date().toISOString(),
  };

  saveDb({
    ...db,
    logs: [newLog, ...db.logs.slice(0, 99)], // keep last 100
  });
}

// ---------------- PRODUCTS CRUD ----------------
export function getProducts(): Product[] {
  return getDb().products;
}

export function getProductById(id: string): Product | undefined {
  return getDb().products.find((p) => p.id === id || p.slug === id);
}

export function saveProduct(productData: Partial<Product> & { name: string }): Product {
  const db = getDb();
  const isNew = !productData.id;
  const now = new Date().toISOString();

  let code = productData.code;
  if (!code) {
    const nextNum = db.products.length + 1;
    code = `PRD-${String(nextNum).padStart(3, '0')}`;
  }

  const slug =
    productData.slug ||
    productData.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const category = db.categories.find((c) => c.id === productData.categoryId);

  const product: Product = {
    id: productData.id || `prod-${Date.now()}`,
    code,
    name: productData.name,
    slug,
    categoryId: productData.categoryId || (db.categories[0]?.id ?? 'cat-camisetas'),
    categoryName: category?.name || productData.categoryName || 'Geral',
    description: productData.description || '',
    shortDescription: productData.shortDescription || '',
    price: Number(productData.price) || 0,
    promotionalPrice: productData.promotionalPrice ? Number(productData.promotionalPrice) : undefined,
    cost: Number(productData.cost) || 0,
    minQuantity: Number(productData.minQuantity) || 1,
    stock: Number(productData.stock) || 0,
    active: productData.active !== undefined ? productData.active : true,
    featured: !!productData.featured,
    isPromotion: !!productData.isPromotion,
    images: productData.images || [],
    availableColors: productData.availableColors || db.colors.slice(0, 4),
    availableSizes: productData.availableSizes || db.sizes.slice(1, 5),
    variants: productData.variants || [],
    allowCustomization: productData.allowCustomization !== undefined ? productData.allowCustomization : true,
    customizationLocations: productData.customizationLocations || ['frente', 'costas', 'peito_esquerdo'],
    createdAt: productData.createdAt || now,
    updatedAt: now,
  };

  const updatedProducts = isNew
    ? [product, ...db.products]
    : db.products.map((p) => (p.id === product.id ? product : p));

  saveDb({ ...db, products: updatedProducts });
  addActivityLog(
    isNew ? 'Cadastrou produto' : 'Atualizou produto',
    `${isNew ? 'Novo produto cadastrado' : 'Produto atualizado'}: ${product.name} (${product.code})`,
    'product',
    product.id
  );

  return product;
}

export function deleteProduct(id: string): boolean {
  const db = getDb();
  const product = db.products.find((p) => p.id === id);
  if (!product) return false;

  const updated = db.products.filter((p) => p.id !== id);
  saveDb({ ...db, products: updated });
  addActivityLog('Excluiu produto', `Produto excluído: ${product.name} (${product.code})`, 'product', id);
  return true;
}

// ---------------- CATEGORIES CRUD ----------------
export function getCategories(): Category[] {
  return getDb().categories;
}

export function saveCategory(catData: Partial<Category> & { name: string }): Category {
  const db = getDb();
  const isNew = !catData.id;
  const slug =
    catData.slug ||
    catData.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const category: Category = {
    id: catData.id || `cat-${Date.now()}`,
    name: catData.name,
    slug,
    description: catData.description || '',
    icon: catData.icon || 'Tag',
    active: catData.active !== undefined ? catData.active : true,
    order: catData.order || db.categories.length + 1,
  };

  const updated = isNew
    ? [...db.categories, category]
    : db.categories.map((c) => (c.id === category.id ? category : c));

  saveDb({ ...db, categories: updated });
  addActivityLog(
    isNew ? 'Cadastrou categoria' : 'Atualizou categoria',
    `Categoria: ${category.name}`,
    'settings',
    category.id
  );
  return category;
}

export function deleteCategory(id: string): boolean {
  const db = getDb();
  const category = db.categories.find((c) => c.id === id);
  if (!category) return false;

  saveDb({ ...db, categories: db.categories.filter((c) => c.id !== id) });
  addActivityLog('Excluiu categoria', `Categoria excluída: ${category.name}`, 'settings', id);
  return true;
}

// ---------------- CUSTOMERS CRUD ----------------
export function getCustomers(): Customer[] {
  return getDb().customers;
}

export function getCustomerById(id: string): Customer | undefined {
  return getDb().customers.find((c) => c.id === id || c.userId === id);
}

export function saveCustomer(custData: Partial<Customer> & { name: string; phone: string }): Customer {
  const db = getDb();
  const isNew = !custData.id;
  const nextNum = db.customers.length + 101;
  const code = custData.code || `CLI-${String(nextNum).padStart(6, '0')}`;

  const customer: Customer = {
    id: custData.id || `cust-${Date.now()}`,
    userId: custData.userId,
    code,
    name: custData.name,
    cpfCnpj: custData.cpfCnpj || '',
    phone: custData.phone,
    whatsapp: custData.whatsapp || custData.phone.replace(/\D/g, ''),
    email: custData.email || '',
    zipCode: custData.zipCode || '',
    address: custData.address || '',
    number: custData.number || '',
    complement: custData.complement || '',
    neighborhood: custData.neighborhood || '',
    city: custData.city || '',
    state: custData.state || 'SP',
    notes: custData.notes || '',
    createdAt: custData.createdAt || new Date().toISOString(),
    totalSpent: custData.totalSpent || 0,
    ordersCount: custData.ordersCount || 0,
  };

  const updated = isNew
    ? [customer, ...db.customers]
    : db.customers.map((c) => (c.id === customer.id ? customer : c));

  saveDb({ ...db, customers: updated });
  addActivityLog(
    isNew ? 'Cadastrou cliente' : 'Atualizou cliente',
    `Cliente ${isNew ? 'cadastrado' : 'atualizado'}: ${customer.name} (${customer.code})`,
    'customer',
    customer.id
  );
  return customer;
}

export function deleteCustomer(id: string): boolean {
  const db = getDb();
  const customer = db.customers.find((c) => c.id === id);
  if (!customer) return false;

  saveDb({ ...db, customers: db.customers.filter((c) => c.id !== id) });
  addActivityLog('Excluiu cliente', `Cliente excluído: ${customer.name} (${customer.code})`, 'customer', id);
  return true;
}

// ---------------- ORDERS CRUD ----------------
export function getOrders(): Order[] {
  return getDb().orders;
}

export function getOrderById(id: string): Order | undefined {
  return getDb().orders.find((o) => o.id === id || o.orderNumber === id);
}

export function saveOrder(orderData: Partial<Order> & { customerName: string; items: Order['items'] }): Order {
  const db = getDb();
  const isNew = !orderData.id;
  const now = new Date().toISOString();

  let orderNumber = orderData.orderNumber;
  if (!orderNumber) {
    const nextSeq = db.orders.length + 101;
    orderNumber = `PED-${String(nextSeq).padStart(6, '0')}`;
  }

  const subtotal = orderData.items.reduce((sum, item) => sum + item.subtotal, 0);
  const discount = orderData.discount || 0;
  const shipping = orderData.shipping !== undefined ? orderData.shipping : 18.0;
  const total = Math.max(0, subtotal - discount + shipping);

  const initialTimeline = orderData.timeline || [
    {
      status: orderData.status || 'novo',
      date: now,
      note: isNew ? 'Pedido registrado no sistema' : 'Pedido atualizado',
      user: 'Sistema',
    },
  ];

  const order: Order = {
    id: orderData.id || `ord-${Date.now()}`,
    orderNumber,
    customerId: orderData.customerId || 'cust-anon',
    customerName: orderData.customerName,
    customerPhone: orderData.customerPhone || '',
    customerWhatsapp: orderData.customerWhatsapp || '',
    customerEmail: orderData.customerEmail || '',
    customerCpfCnpj: orderData.customerCpfCnpj || '',
    shippingAddress: orderData.shippingAddress || {
      zipCode: '01001-000',
      address: 'Rua Principal',
      number: '100',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
    },
    items: orderData.items,
    subtotal,
    discount,
    shipping,
    total,
    paymentMethod: orderData.paymentMethod || 'pix',
    paymentStatus: orderData.paymentStatus || 'pendente',
    status: orderData.status || 'novo',
    notes: orderData.notes || '',
    internalNotes: orderData.internalNotes || '',
    timeline: initialTimeline,
    createdAt: orderData.createdAt || now,
    updatedAt: now,
  };

  const updatedOrders = isNew
    ? [order, ...db.orders]
    : db.orders.map((o) => (o.id === order.id ? order : o));

  // Update customer stats
  const customer = db.customers.find((c) => c.id === order.customerId || c.email === order.customerEmail);
  let updatedCustomers = db.customers;
  if (customer) {
    const custOrders = updatedOrders.filter((o) => o.customerId === customer.id || o.customerEmail === customer.email);
    const totalSpent = custOrders.reduce((acc, curr) => acc + curr.total, 0);
    updatedCustomers = db.customers.map((c) =>
      c.id === customer.id ? { ...c, totalSpent, ordersCount: custOrders.length } : c
    );
  }

  saveDb({ ...db, orders: updatedOrders, customers: updatedCustomers });
  addActivityLog(
    isNew ? 'Criou novo pedido' : 'Atualizou pedido',
    `Pedido ${order.orderNumber} para ${order.customerName} - Total: R$ ${order.total.toFixed(2)}`,
    'order',
    order.id
  );

  return order;
}

export function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  note?: string,
  userName = 'Administrador'
): Order | null {
  const db = getDb();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) return null;

  const now = new Date().toISOString();
  const newTimelineItem = {
    status: newStatus,
    date: now,
    note: note || `Status alterado para ${newStatus}`,
    user: userName,
  };

  const updatedOrder: Order = {
    ...order,
    status: newStatus,
    updatedAt: now,
    timeline: [...order.timeline, newTimelineItem],
  };

  const updatedOrders = db.orders.map((o) => (o.id === orderId ? updatedOrder : o));
  saveDb({ ...db, orders: updatedOrders });
  addActivityLog(
    'Alterou status do pedido',
    `Pedido ${order.orderNumber} alterado de "${order.status}" para "${newStatus}"`,
    'order',
    order.id,
    userName
  );

  return updatedOrder;
}

export function deleteOrder(id: string): boolean {
  const db = getDb();
  const order = db.orders.find((o) => o.id === id);
  if (!order) return false;

  saveDb({ ...db, orders: db.orders.filter((o) => o.id !== id) });
  addActivityLog('Excluiu pedido', `Pedido excluído: ${order.orderNumber}`, 'order', id);
  return true;
}

// ---------------- QUOTES CRUD ----------------
export function getQuotes(): Quote[] {
  return getDb().quotes;
}

export function getQuoteById(id: string): Quote | undefined {
  return getDb().quotes.find((q) => q.id === id || q.quoteNumber === id);
}

export function saveQuote(quoteData: Partial<Quote> & { customerName: string; items: Quote['items'] }): Quote {
  const db = getDb();
  const isNew = !quoteData.id;
  const now = new Date().toISOString();

  let quoteNumber = quoteData.quoteNumber;
  if (!quoteNumber) {
    const nextSeq = db.quotes.length + 1;
    quoteNumber = `ORC-${String(nextSeq).padStart(6, '0')}`;
  }

  const subtotal = quoteData.items.reduce((sum, item) => sum + item.subtotal, 0);
  const discount = quoteData.discount || 0;
  const shipping = quoteData.shipping !== undefined ? quoteData.shipping : 0;
  const total = Math.max(0, subtotal - discount + shipping);

  // default 15 days expiration
  const expDate = new Date();
  expDate.setDate(expDate.getDate() + 15);

  const quote: Quote = {
    id: quoteData.id || `orc-${Date.now()}`,
    quoteNumber,
    customerId: quoteData.customerId || 'cust-anon',
    customerName: quoteData.customerName,
    customerPhone: quoteData.customerPhone || '',
    customerWhatsapp: quoteData.customerWhatsapp || '',
    customerEmail: quoteData.customerEmail || '',
    items: quoteData.items,
    subtotal,
    discount,
    shipping,
    total,
    status: quoteData.status || 'novo',
    notes: quoteData.notes || '',
    expiresAt: quoteData.expiresAt || expDate.toISOString(),
    createdAt: quoteData.createdAt || now,
    convertedOrderId: quoteData.convertedOrderId,
  };

  const updatedQuotes = isNew
    ? [quote, ...db.quotes]
    : db.quotes.map((q) => (q.id === quote.id ? quote : q));

  saveDb({ ...db, quotes: updatedQuotes });
  addActivityLog(
    isNew ? 'Criou orçamento' : 'Atualizou orçamento',
    `Orçamento ${quote.quoteNumber} para ${quote.customerName} - Total: R$ ${quote.total.toFixed(2)}`,
    'quote',
    quote.id
  );

  return quote;
}

export function convertQuoteToOrder(quoteId: string, userName = 'Administrador'): Order | null {
  const db = getDb();
  const quote = db.quotes.find((q) => q.id === quoteId);
  if (!quote) return null;

  // Build order from quote
  const orderItems = quote.items.map((item) => ({
    id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    productId: item.productId,
    productName: item.productName,
    productImage: item.productImage,
    colorName: item.colorName,
    colorHex: item.colorHex,
    sizeName: item.sizeName,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    subtotal: item.subtotal,
    customization: item.customization,
  }));

  const customer = db.customers.find((c) => c.id === quote.customerId);

  const newOrder = saveOrder({
    customerId: quote.customerId,
    customerName: quote.customerName,
    customerPhone: quote.customerPhone,
    customerWhatsapp: quote.customerWhatsapp,
    customerEmail: quote.customerEmail,
    customerCpfCnpj: customer?.cpfCnpj || '',
    shippingAddress: {
      zipCode: customer?.zipCode || '01001-000',
      address: customer?.address || 'Endereço a confirmar',
      number: customer?.number || 'S/N',
      neighborhood: customer?.neighborhood || 'Centro',
      city: customer?.city || 'São Paulo',
      state: customer?.state || 'SP',
    },
    items: orderItems,
    discount: quote.discount,
    shipping: quote.shipping,
    paymentMethod: 'pix',
    paymentStatus: 'pendente',
    status: 'aguardando_pagamento',
    notes: `Convertido do Orçamento ${quote.quoteNumber}. ${quote.notes || ''}`,
  });

  // Mark quote as converted
  const updatedQuote: Quote = {
    ...quote,
    status: 'convertido',
    convertedOrderId: newOrder.id,
  };

  const updatedQuotes = db.quotes.map((q) => (q.id === quoteId ? updatedQuote : q));
  saveDb({ ...getDb(), quotes: updatedQuotes });

  addActivityLog(
    'Converteu orçamento em pedido',
    `Orçamento ${quote.quoteNumber} convertido no Pedido ${newOrder.orderNumber}`,
    'quote',
    quote.id,
    userName
  );

  return newOrder;
}

export function deleteQuote(id: string): boolean {
  const db = getDb();
  const quote = db.quotes.find((q) => q.id === id);
  if (!quote) return false;

  saveDb({ ...db, quotes: db.quotes.filter((q) => q.id !== id) });
  addActivityLog('Excluiu orçamento', `Orçamento excluído: ${quote.quoteNumber}`, 'quote', id);
  return true;
}

// ---------------- SETTINGS & CONFIG ----------------
export function getCompanySettings(): CompanySettings {
  return getDb().settings;
}

export function saveCompanySettings(newSettings: Partial<CompanySettings>): CompanySettings {
  const db = getDb();
  const updated: CompanySettings = {
    ...db.settings,
    ...newSettings,
  };
  saveDb({ ...db, settings: updated });
  addActivityLog('Atualizou configurações', 'Configurações da empresa atualizadas', 'settings');
  return updated;
}

// ---------------- COLORS & SIZES CRUD ----------------
export function getColors(): Color[] {
  return getDb().colors;
}

export function saveColor(color: Color): Color {
  const db = getDb();
  const isNew = !db.colors.some((c) => c.id === color.id);
  const updated = isNew
    ? [...db.colors, color]
    : db.colors.map((c) => (c.id === color.id ? color : c));
  saveDb({ ...db, colors: updated });
  return color;
}

export function deleteColor(id: string): void {
  const db = getDb();
  saveDb({ ...db, colors: db.colors.filter((c) => c.id !== id) });
}

export function getSizes(): Size[] {
  return getDb().sizes;
}

export function saveSize(size: Size): Size {
  const db = getDb();
  const isNew = !db.sizes.some((s) => s.id === size.id);
  const updated = isNew
    ? [...db.sizes, size]
    : db.sizes.map((s) => (s.id === size.id ? size : s));
  saveDb({ ...db, sizes: updated });
  return size;
}

export function deleteSize(id: string): void {
  const db = getDb();
  saveDb({ ...db, sizes: db.sizes.filter((s) => s.id !== id) });
}

// ---------------- USERS CRUD ----------------
export function getUsers(): User[] {
  return getDb().users;
}

export function saveUser(user: User): User {
  const db = getDb();
  const isNew = !db.users.some((u) => u.id === user.id);
  const updated = isNew
    ? [...db.users, user]
    : db.users.map((u) => (u.id === user.id ? user : u));
  saveDb({ ...db, users: updated });
  return user;
}

export function deleteUser(id: string): void {
  const db = getDb();
  saveDb({ ...db, users: db.users.filter((u) => u.id !== id) });
}

// ---------------- COUPONS CRUD ----------------
export function getCoupons(): Coupon[] {
  return getDb().coupons || [];
}

export function saveCoupon(couponData: Partial<Coupon> & { code: string }): Coupon {
  const db = getDb();
  const isNew = !couponData.id;
  const coupon: Coupon = {
    id: couponData.id || `cup-${Date.now()}`,
    code: couponData.code.toUpperCase().trim(),
    discountType: couponData.discountType || 'percentage',
    discountValue: Number(couponData.discountValue) || 10,
    minOrderValue: couponData.minOrderValue ? Number(couponData.minOrderValue) : undefined,
    maxDiscount: couponData.maxDiscount ? Number(couponData.maxDiscount) : undefined,
    usageLimit: couponData.usageLimit ? Number(couponData.usageLimit) : undefined,
    usageCount: couponData.usageCount || 0,
    active: couponData.active !== undefined ? couponData.active : true,
    expiresAt: couponData.expiresAt,
    createdAt: couponData.createdAt || new Date().toISOString(),
  };

  const updated = isNew
    ? [coupon, ...(db.coupons || [])]
    : (db.coupons || []).map((c) => (c.id === coupon.id ? coupon : c));

  saveDb({ ...db, coupons: updated });
  return coupon;
}

export function deleteCoupon(id: string): void {
  const db = getDb();
  saveDb({ ...db, coupons: (db.coupons || []).filter((c) => c.id !== id) });
}

// ---------------- RESET / RESTORE DATABASE ----------------
export function resetDatabaseToDefaults(): void {
  const initial = getInitialDatabase();
  saveDb(initial);
  addActivityLog('Restaurou banco de dados', 'Banco restaurado para os dados padrão de fábrica', 'settings');
}

export const resetDatabase = resetDatabaseToDefaults;

export function exportDatabaseJSON(): string {
  return JSON.stringify(getDb(), null, 2);
}

export function restoreDatabase(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.products || !parsed.settings) {
      throw new Error('Formato inválido de backup');
    }
    saveDb(parsed);
    addActivityLog('Importou backup do banco', 'Arquivo JSON de backup importado com sucesso', 'settings');
    return true;
  } catch (err) {
    console.error('Falha ao restaurar banco:', err);
    return false;
  }
}

export const importDatabaseJSON = restoreDatabase;

