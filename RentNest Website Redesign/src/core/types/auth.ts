export type UserRole =
  | 'ROLE_GUEST'
  | 'ROLE_TENANT'
  | 'ROLE_PROPERTY_OWNER'
  | 'ROLE_VENDOR'
  | 'ROLE_ADMIN'
  | 'ROLE_SUPPORT';

export interface UserClaims {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl?: string;
  phoneNumber?: string;
  roleName: UserRole;
  permissions: string[];
  mfaEnabled: boolean;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
}

export interface AuthSession {
  accessToken: string;
  expiresAt: number;
  user: UserClaims;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  roleId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: UserClaims;
  mfaRequired?: boolean;
}
