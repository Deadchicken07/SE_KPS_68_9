export interface LoginResponse {
  access_token?: string;
  message?: string;
}

export interface AuthMeResponse {
  sub: number;
  email: string | null;
  role_id: number | null;
  name?: string | null;
  sur_name?: string | null;
  file_name?: string | null;
}
