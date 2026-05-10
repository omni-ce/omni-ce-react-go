import type { Gender } from "@/types/option";

export enum MarketingCustomerType {
  Reseller = "reseller",
  B2B = "b2b",
  Retail = "retail",
}

export interface MarketingCustomer {
  id: number;
  branch_id: number;
  branch_name: string;
  type: MarketingCustomerType;
  phone: string;
  name: string;
  gender: Gender;
  dob: string;
  email: string;
  plafond: number; // only view
  total_piutang: number; // only view
  is_pkp: boolean;
  is_active: boolean;
  created_at: string;
  created_by: number;
  updated_at: string;
  updated_by: number;
}
