export type AuthProviderType = "email" | "google" | "guest";

export interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
  provider: AuthProviderType;
  createdAt: string;
}

export interface AuthSession {
  user: AuthUser;
  provider: AuthProviderType;
}
