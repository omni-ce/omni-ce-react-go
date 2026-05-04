export interface User {
  id?: string;
  // auth
  username: string;
  password?: string;
  // profile
  name: string;
  avatar?: string;
  phone_number?: string;
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
