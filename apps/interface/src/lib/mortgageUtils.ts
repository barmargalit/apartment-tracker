import type { MortgageTrackType, MortgageTrackData, MortgageTrack as ApiMortgageTrack } from "@xpensive/types";

export interface TrackInputs {
  principal: number;
  years: number;
  /** Annual interest rate in % (all tracks except prime) */
  annualRate?: number;
  /** Expected annual CPI in % (index-linked tracks) */
  annualCpi?: number;
  /** Bank of Israel prime rate in % (prime track) */
  primeRate?: number;
  /** Spread added to prime rate in % — may be negative (prime track) */
  primeSpread?: number;
  /** Expected annual FX appreciation in % — positive = foreign currency appreciates (foreign_currency track) */
  fxAnnualChange?: number;
}

export interface AmortizationRow {
  month: number;
  beginningBalance: number;
  scheduledPayment: number;
  principal: number;
  interest: number;
  endingBalance: number;
}

/** Standard monthly payment: M = P × [r(1+r)^n] / [(1+r)^n − 1] */
function monthlyPayment(balance: number, monthlyRate: number, remainingMonths: number): number {
  if (monthlyRate === 0) return balance / remainingMonths;
  const factor = Math.pow(1 + monthlyRate, remainingMonths);
  return balance * (monthlyRate * factor) / (factor - 1);
}

/** Standard fixed-rate amortization (no indexing). Used by fixed_unlinked and prime. */
function calcFixedAmortization(principal: number, months: number, monthlyRate: number): AmortizationRow[] {
  const rows: AmortizationRow[] = [];
  let balance = principal;
  const payment = monthlyPayment(balance, monthlyRate, months);

  for (let m = 1; m <= months; m++) {
    const beginningBalance = balance;
    const interest = balance * monthlyRate;
    const principalPaid = Math.min(payment - interest, balance);
    const scheduledPayment = principalPaid + interest;
    const endingBalance = Math.max(balance - principalPaid, 0);
    rows.push({ month: m, beginningBalance, scheduledPayment, principal: principalPaid, interest, endingBalance });
    balance = endingBalance;
    if (balance < 0.01) break;
  }
  return rows;
}

/**
 * Index-linked amortization (CPI or FX). Each month the balance is inflated by a monthly
 * adjustment factor before the payment is calculated. Payment is recalculated each month
 * on the inflated balance and remaining term, matching the Israeli bank standard.
 */
function calcInflationLinkedAmortization(
  principal: number,
  months: number,
  monthlyRate: number,
  monthlyInflation: number,
): AmortizationRow[] {
  const rows: AmortizationRow[] = [];
  let balance = principal;

  for (let m = 1; m <= months; m++) {
    const beginningBalance = balance;
    // Inflate balance before this month's payment
    const inflatedBalance = balance * (1 + monthlyInflation);
    const remaining = months - m + 1;
    const payment = monthlyPayment(inflatedBalance, monthlyRate, remaining);
    const interest = inflatedBalance * monthlyRate;
    const principalPaid = Math.min(payment - interest, inflatedBalance);
    const endingBalance = Math.max(inflatedBalance - principalPaid, 0);
    rows.push({
      month: m,
      beginningBalance,
      scheduledPayment: payment,
      principal: principalPaid,
      interest,
      endingBalance,
    });
    balance = endingBalance;
    if (balance < 0.01) break;
  }
  return rows;
}

export function calcAmortization(type: MortgageTrackType, inputs: TrackInputs): AmortizationRow[] {
  const { principal, years } = inputs;
  const months = years * 12;

  switch (type) {
    case "fixed_unlinked": {
      const r = (inputs.annualRate ?? 0) / 100 / 12;
      return calcFixedAmortization(principal, months, r);
    }

    case "prime": {
      const effectiveRate = ((inputs.primeRate ?? 0) + (inputs.primeSpread ?? 0)) / 100 / 12;
      return calcFixedAmortization(principal, months, effectiveRate);
    }

    case "fixed_index_linked": {
      const r = (inputs.annualRate ?? 0) / 100 / 12;
      const cpi = (inputs.annualCpi ?? 0) / 100 / 12;
      return calcInflationLinkedAmortization(principal, months, r, cpi);
    }

    case "variable_index_linked": {
      // Variable rate changes are not yet captured via UI; treated as fixed CPI-linked
      const r = (inputs.annualRate ?? 0) / 100 / 12;
      const cpi = (inputs.annualCpi ?? 0) / 100 / 12;
      return calcInflationLinkedAmortization(principal, months, r, cpi);
    }

    case "foreign_currency": {
      const r = (inputs.annualRate ?? 0) / 100 / 12;
      const fx = (inputs.fxAnnualChange ?? 0) / 100 / 12;
      return calcInflationLinkedAmortization(principal, months, r, fx);
    }
  }
}

export interface LocalTrack {
  localId: string;
  dbId?: string;
  type: MortgageTrackType;
  inputs: TrackInputs;
}

export interface LocalPlan {
  localId: string;
  dbId?: string;
  totalLoan: number;
  bankId?: string | null;
  tracks: LocalTrack[];
}

export function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

/** Convert an API MortgageTrack's data blob → TrackInputs used by the calculator. */
export function apiTrackToInputs(track: ApiMortgageTrack): TrackInputs {
  const d = track.data as unknown as Record<string, number>;
  return {
    principal: track.amount,
    years: track.years,
    annualRate: d.annualRate,
    annualCpi: d.annualCpi,
    primeRate: d.primeRate,
    primeSpread: d.primeSpread,
    fxAnnualChange: d.fxAnnualChange,
  };
}

/** Convert TrackInputs → the data blob stored in the DB. */
export function inputsToApiData(type: MortgageTrackType, inputs: TrackInputs): MortgageTrackData {
  switch (type) {
    case "fixed_unlinked":
      return { annualRate: inputs.annualRate ?? 0 };
    case "fixed_index_linked":
    case "variable_index_linked":
      return { annualRate: inputs.annualRate ?? 0, annualCpi: inputs.annualCpi ?? 0 };
    case "prime":
      return { primeRate: inputs.primeRate ?? 0, primeSpread: inputs.primeSpread ?? 0 };
    case "foreign_currency":
      return { annualRate: inputs.annualRate ?? 0, fxAnnualChange: inputs.fxAnnualChange ?? 0 };
  }
}
