
export interface MarketAsset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  marketCap: string;
  volume24h: string;
  spread?: number;
  pipSize?: number;
}

export interface TradingStrategy {
  name: string;
  riskProfile: 'Low' | 'Medium' | 'High';
  indicators: string[];
  entryCondition: string;
  exitCondition: string;
  timeframe: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  TRADER = 'TRADER'
}

export type UserStatus = 'ACTIVE' | 'SUSPENDED';
export type PaymentMethodType = 'PAYPAL' | 'BANK' | 'MOBILE';
export type Theme = 'light' | 'dark';
export type TradeType = 'BINARY' | 'FOREX';

export interface LinkedAccount {
  id: string;
  type: PaymentMethodType;
  label: string;
  details: string;
  provider?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  country?: string;
  accountDetails?: string;
  balance?: number;
  demoBalance?: number;
  margin?: number;
  freeMargin?: number;
  equity?: number;
  linkedAccounts?: LinkedAccount[];
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  username: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: number;
  methodType: PaymentMethodType;
  destinationDetails: string;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  active: boolean;
}

export interface AlertNotification {
  id: string;
  symbol: string;
  price: number;
  message: string;
  timestamp: number;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  MARKET_INSIGHTS = 'MARKET_INSIGHTS',
  STRATEGY_BUILDER = 'STRATEGY_BUILDER',
  LIVE_ASSISTANT = 'LIVE_ASSISTANT',
  SECURITY_HUB = 'SECURITY_HUB',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  WITHDRAWAL_REQUESTS = 'WITHDRAWAL_REQUESTS',
  TRADER_WALLET = 'TRADER_WALLET',
  DEMO_TRADING = 'DEMO_TRADING'
}

export enum AuthView {
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER'
}
