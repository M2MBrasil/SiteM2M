import {
  Category,
  Color,
  CompanySettings,
  Customer,
  Order,
  Product,
  Quote,
  Size,
  User,
  ActivityLog,
} from './types';

export const INITIAL_SETTINGS: CompanySettings = {
  id: 'settings-1',
  companyName: 'M2MBrasil Produtos Personalizados',
  tradeName: 'M2MBrasil',
  cnpj: '38.452.910/0001-84',
  logoUrl: '',
  phone: '(15) 99601-9227',
  whatsapp: '5515996019227',
  whatsappCountryCode: '55',
  whatsappAreaCode: '15',
  whatsappNumber: '996019227',
  whatsappDefaultMessage:
    'Olá, M2MBrasil! Gostaria de mais informações sobre produtos personalizados e orçamentos.',
  email: 'contato@m2mbrasil.com.br',
  instagram: '@m2mbrasil.personalizados',
  facebook: 'fb.com/m2mbrasil',
  address: 'Av. Paulista, 1000 - Bela Vista',
  number: '1000',
  complement: 'Conjunto 42',
  neighborhood: 'Bela Vista',
  city: 'São Paulo',
  state: 'SP',
  zipCode: '01310-100',
  deliveryFeeDefault: 18.0,
  minOrderValueForFreeShipping: 250.0,
  freeShippingEnabled: true,
  pixKeyType: 'cnpj',
  pixKey: '38452910000184',
  pixReceiverName: 'M2MBrasil Personalizados Ltda',
  pixCity: 'São Paulo',
};

export const INITIAL_COLORS: Color[] = [
  { id: 'c-preto', name: 'Preto', hex: '#111827', active: true },
  { id: 'c-branco', name: 'Branco', hex: '#F9FAFB', active: true },
  { id: 'c-azul-royal', name: 'Azul Royal', hex: '#1D4ED8', active: true },
  { id: 'c-azul-marinho', name: 'Azul Marinho', hex: '#0F172A', active: true },
  { id: 'c-vermelho', name: 'Vermelho', hex: '#DC2626', active: true },
  { id: 'c-verde-bandeira', name: 'Verde Bandeira', hex: '#15803D', active: true },
  { id: 'c-verde-militar', name: 'Verde Militar', hex: '#4D7C0F', active: true },
  { id: 'c-amarelo', name: 'Amarelo Ouro', hex: '#EAB308', active: true },
  { id: 'c-rosa', name: 'Rosa Claro', hex: '#F472B6', active: true },
  { id: 'c-pink', name: 'Pink Neon', hex: '#DB2777', active: true },
  { id: 'c-lilas', name: 'Lilás', hex: '#A855F7', active: true },
  { id: 'c-cinza-mescla', name: 'Cinza Mescla', hex: '#94A3B8', active: true },
];

export const INITIAL_SIZES: Size[] = [
  { id: 's-infantil', name: 'Infantil', order: 1, active: true },
  { id: 's-p', name: 'P', order: 2, active: true },
  { id: 's-m', name: 'M', order: 3, active: true },
  { id: 's-g', name: 'G', order: 4, active: true },
  { id: 's-gg', name: 'GG', order: 5, active: true },
  { id: 's-g1', name: 'G1', order: 6, active: true },
  { id: 's-g2', name: 'G2', order: 7, active: true },
  { id: 's-g3', name: 'G3', order: 8, active: true },
  { id: 's-unico', name: 'Tamanho Único', order: 9, active: true },
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-camisetas',
    name: 'Camisetas & Dry Fit',
    slug: 'camisetas-dry-fit',
    description: 'Camisetas em tecido Dry Fit tecnológico, 100% Algodão e Poliviscose.',
    icon: 'Shirt',
    active: true,
    order: 1,
  },
  {
    id: 'cat-moletons',
    name: 'Moletons & Agasalhos',
    slug: 'moletons-agasalhos',
    description: 'Moletons flanelados canguru, gola careca e zíper com estampa de alta durabilidade.',
    icon: 'Layers',
    active: true,
    order: 2,
  },
  {
    id: 'cat-bones',
    name: 'Bonés & Acessórios',
    slug: 'bones-acessorios',
    description: 'Bonés trucker com tela respirável, bonés dad hat e aba reta personalizados.',
    icon: 'Sparkles',
    active: true,
    order: 3,
  },
  {
    id: 'cat-canecas',
    name: 'Canecas & Brindes',
    slug: 'canecas-brindes',
    description: 'Canecas de porcelana resinada, alumínio, copos térmicos e squeezer.',
    icon: 'Coffee',
    active: true,
    order: 4,
  },
  {
    id: 'cat-uniformes',
    name: 'Uniformes Empresariais',
    slug: 'uniformes-empresariais',
    description: 'Linha corporativa para equipes comerciais, operacionais e de eventos.',
    icon: 'Briefcase',
    active: true,
    order: 5,
  },
  {
    id: 'cat-polo-babylook',
    name: 'Camisas Polo & Baby Look',
    slug: 'camisas-polo-baby-look',
    description: 'Polos em piquet premium e baby looks com modelagem ajustada.',
    icon: 'Tag',
    active: true,
    order: 6,
  },
];

// ZERADO: Pronto para cadastro real dos produtos através do painel de administração
export const INITIAL_PRODUCTS: Product[] = [];

// Apenas o usuário de Administrador Oficial MauricioM2M
export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-mauricio',
    name: 'Maurício Mastorillo (Admin)',
    email: 'MauricioM2M',
    password: '78645524',
    role: 'admin',
    phone: '(15) 99601-9227',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

// ZERADO: Lista de clientes limpa
export const INITIAL_CUSTOMERS: Customer[] = [];

// ZERADO: Lista de pedidos limpa
export const INITIAL_ORDERS: Order[] = [];

// ZERADO: Lista de orçamentos limpa
export const INITIAL_QUOTES: Quote[] = [];

// ZERADO: Histórico de atividades limpo
export const INITIAL_LOGS: ActivityLog[] = [];
