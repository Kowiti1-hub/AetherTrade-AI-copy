
import { MarketAsset } from '../types';
import { MOCK_ASSETS } from '../constants';

export class MarketDataService {
  private COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

  /**
   * Fetches real-time prices for a set of crypto assets.
   * Falling back to mock data if the API rate limit is hit or for non-crypto assets.
   */
  async getLatestPrices(): Promise<MarketAsset[]> {
    try {
      // Map our mock assets to CoinGecko IDs (for demo purposes)
      const idMap: Record<string, string> = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'SOL': 'solana',
      };

      const ids = Object.values(idMap).join(',');
      const response = await fetch(
        `${this.COINGECKO_BASE}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
      );

      if (!response.ok) throw new Error('API limit reached');

      const data = await response.json();

      return MOCK_ASSETS.map(asset => {
        const cgId = idMap[asset.symbol];
        if (cgId && data[cgId]) {
          return {
            ...asset,
            price: data[cgId].usd,
            change: parseFloat(data[cgId].usd_24h_change.toFixed(2)),
            marketCap: this.formatCurrency(data[cgId].usd_market_cap),
            volume24h: this.formatCurrency(data[cgId].usd_24h_vol)
          };
        }
        // For stocks (AAPL, NVDA) which are not in CG, we simulate small fluctuations
        // to show "real-time" behavior in the UI.
        return {
          ...asset,
          price: asset.price + (Math.random() - 0.5) * 0.5,
          change: asset.change + (Math.random() - 0.5) * 0.1
        };
      });
    } catch (error) {
      console.warn('MarketDataService: Using fallback/simulated data.', error);
      // Return mock data with jitter for stocks
      return MOCK_ASSETS.map(asset => ({
        ...asset,
        price: asset.price + (Math.random() - 0.5) * 0.1,
      }));
    }
  }

  private formatCurrency(value: number): string {
    if (value >= 1e12) return (value / 1e12).toFixed(2) + 'T';
    if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B';
    if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M';
    return value.toLocaleString();
  }
}

export const marketData = new MarketDataService();
