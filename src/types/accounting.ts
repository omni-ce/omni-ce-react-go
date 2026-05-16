export interface ChartOfAccount {
  id: number;
  code: string;
  name: string;
  category: string;
  type: string;
  is_active: boolean;
}

export interface Journal {
  id: number;
  date: string;
  reference: string;
  description: string;
  amount: number;
  is_active: boolean;
}

export interface GeneralLedger {
  id: number;
  account_code: string;
  account_name: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}
