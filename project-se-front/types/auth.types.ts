export interface LoginResponse {
  access_token?: string;
  message?: string;
}

export interface AuthMeResponse {
  sub: number;
  email: string;
  role_id: number | null;
}
