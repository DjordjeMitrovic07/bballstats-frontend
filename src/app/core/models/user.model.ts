export type Role = 'USER' | 'ADMIN';

export interface UserInfo {
  id: number;
  email: string;
  username: string;
  role: Role;
}
