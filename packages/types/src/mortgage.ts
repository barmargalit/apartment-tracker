export type MortgageTrackType =
  | 'fixed_index_linked'
  | 'variable_index_linked'
  | 'prime'
  | 'fixed_unlinked'
  | 'foreign_currency';

export interface FixedUnlinkedData {
  annualRate: number;
}
export interface FixedIndexLinkedData {
  annualRate: number;
  annualCpi: number;
}
export interface VariableIndexLinkedData {
  annualRate: number;
  annualCpi: number;
}
export interface PrimeData {
  primeRate: number;
  primeSpread: number;
}
export interface ForeignCurrencyData {
  annualRate: number;
  fxAnnualChange: number;
}
export type MortgageTrackData =
  | FixedUnlinkedData
  | FixedIndexLinkedData
  | VariableIndexLinkedData
  | PrimeData
  | ForeignCurrencyData;

export interface MortgagePlan {
  id: string;
  created: Date;
  modified: Date;
  state: number;
  total_loan: number;
  bank_id: string | null;
}

export interface MortgageTrack {
  id: string;
  created: Date;
  modified: Date;
  state: number;
  plan_id: string;
  type: MortgageTrackType;
  amount: number;
  years: number;
  months: number;
  data: MortgageTrackData;
}
