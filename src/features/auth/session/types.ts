export interface AuthSessionStatus {
  authenticated: boolean;
}

export type AuthTokenSource =
  | 'desktop-keychain'
  | 'payload'
  | 'legacy-callback';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  refreshExpiresIn?: number;
  source?: AuthTokenSource;
  receivedAt: number;
}

export interface AuthTokenPayload {
  access_token?: string | null;
  accessToken?: string | null;
  token?: string | null;
  refresh_token?: string | null;
  refreshToken?: string | null;
  expires_in?: string | number | null;
  expiresIn?: string | number | null;
  refresh_expires_in?: string | number | null;
  refreshExpiresIn?: string | number | null;
}
