export interface User {
  id?: string;
  // auth
  username: string;
  password?: string;
  // profile
  name: string;
  avatar?: string;
  phone_number?: string;
  roles: string[];
  is_active: boolean;
  created_at: string;
}
