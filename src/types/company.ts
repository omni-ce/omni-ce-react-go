// perusahaan / badan hukum
export interface CompanyEntity {
  id: number;
  logo: string;
  name: string;
  npwp_code: string;
  is_taxpayer: boolean;
  npwp_alias: string;
  address: string;
  address_code: string;
  full_address: string;
  is_active: boolean;
  created_at: string;
  created_by: number;
  updated_at: string;
  updated_by: number;
}

// cabang
export interface CompanyBranch {
  id: number;
  entity_id: number;
  entity_name: string;
  code: string;
  name: string;
  alias: string;
  alias_code: string;
  address: string;
  address_code: string;
  full_address: string;
  phone: string;
  map: {
    longitude: number;
    latitude: number;
  };
  is_active: boolean;
  created_at: string;
  created_by: number;
  updated_at: string;
  updated_by: number;
}
