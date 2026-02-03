
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
export type OrderExecutionType = 'MARKET' | 'PENDING';
export type PendingOrderType = 'BUY_LIMIT' | 'SELL_LIMIT' | 'BUY_STOP' | 'SELL_STOP';
export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'TRADE_OPEN' | 'TRADE_CLOSE';

export interface Transaction {
  id: string;
  userId: string;
  username: string;
  amount: number;
  type: TransactionType;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  timestamp: number;
  methodType?: PaymentMethodType;
  details: string;
}

export interface PendingOrder {
  id: string;
  pair: string;
  type: PendingOrderType;
  triggerPrice: number;
  size: number;
  leverage: number;
  sl?: number;
  tp?: number;
}

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
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  password?: string; // For simulation of password change
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
  paybillNumber?: string; // Unique Paybill for direct deposit tracking
  profilePicture?: string;
  emailVerified?: boolean;
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
  ABOUT_SYSTEM = 'ABOUT_SYSTEM',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  WITHDRAWAL_REQUESTS = 'WITHDRAWAL_REQUESTS',
  TRADER_WALLET = 'TRADER_WALLET',
  DEMO_TRADING = 'DEMO_TRADING',
  PROFILE = 'PROFILE',
  TRANSACTION_HISTORY = 'TRANSACTION_HISTORY',
  SECURITY_HUB = 'SECURITY_HUB'
}

export enum AuthView {
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER'
}
