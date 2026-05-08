// perusahaan / badan hukum
export interface Entity {
  id: number;
  logo: string;
  name: string;
  npwp: string;
  alias: string;
  address: string;
  city: string;
  category: string;
  is_active: boolean;
  created_at: string;
  created_by: number;
  updated_at: string;
  updated_by: number;
}

// cabang
export interface Branch {
  id: number;
  entity_id: number;
  code: string;
  logo: string;
  name: string;
  alias: string;
  alias_code: string;
  address: string;
  city: string;
  phone: string;
  category: string;
  longitude: number;
  latitude: number;
  is_active: boolean;
  created_at: string;
  created_by: number;
  updated_at: string;
  updated_by: number;
}
