export  type UserRole = 'Basic' | 'Pro' | 'Admin';

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  proDaysLeft: number;
  createdAt?: string;
}

export interface Tool {
  id: string;
  category: 'Mecânica' | 'Elétrica';
  description: string;
  link: string;
  accessLevel: 'Basic' | 'Pro';
  isExternal: boolean;
  createdAt?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  daysGranted: number;
  usesLeft: number;
  totalUses: number;
  createdAt?: string;
}
 