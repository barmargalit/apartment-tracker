import { BillType } from './bill';

export interface CellularContractData {
  data_gb: number;
  calls_unlimited: boolean;
  calls_minutes?: number;
  sms_unlimited: boolean;
  sms_count?: number;
}

export interface InternetContractData {
  speed_mbps: number;
}

export interface GenericContractData {}

export type ContractData =
  | CellularContractData
  | InternetContractData
  | GenericContractData;

export interface Contract {
  id: string;
  created: Date;
  modified: Date;
  /** 0 = active, 1 = deleted */
  state: number;
  bill_type: BillType;
  provider_id: string;
  residence_id: string | null;
  resident_id: string | null;
  monthly_price: number;
  start_date: string;
  end_date: string | null;
  comment: string | null;
  data: ContractData;
}
