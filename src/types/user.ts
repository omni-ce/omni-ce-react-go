export interface User {
  id?: string;
  // profile
  name: string;
  avatar?: string;
  phone_number?: string;
  address?: string;
  // auth
  username: string;
  password?: string;
  role?: string;
  roles: {
    role_id: string;
    role_name: string;
    division_id: string;
    division_name: string;
  }[];
  is_active: boolean;
  created_at: string;
}
