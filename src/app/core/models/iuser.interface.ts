export interface IUser {
  id: string;
  name: string;
  role: 'user' | 'admin' | string;
  iat: number;
  exp: number;
}
