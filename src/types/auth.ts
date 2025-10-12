export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user_id?: string;
  role?: string;
  session_expires_at?: Date;
}
