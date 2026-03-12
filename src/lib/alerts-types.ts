export interface RateAlert {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  condition: 'above' | 'below';
  threshold: number;
  active: boolean;
  createdAt: string;
  triggeredAt?: string;
}

export interface AlertCheckResult {
  alert: RateAlert;
  currentRate: number;
  triggered: boolean;
}

export type AlertCondition = 'above' | 'below';
