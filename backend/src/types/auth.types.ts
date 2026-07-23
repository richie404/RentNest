export interface UserRecord {
  user_id: number;
  email: string;
  password_hash: string;
  phone_number: string | null;
  account_status: "ACTIVE" | "SUSPENDED" | "UNVERIFIED";
  created_at: Date;
  updated_at: Date;
}

export interface UserProfileRecord {
  profile_id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  date_of_birth: Date | null;
  ssn_tax_id_hash: string | null;
  avatar_url: string | null;
  emergency_contact_json: any;
  updated_at: Date;
}

export interface UserWithRoleAndPermissions {
  userId: number;
  email: string;
  passwordHash: string;
  phoneNumber: string | null;
  accountStatus: "ACTIVE" | "SUSPENDED" | "UNVERIFIED";
  roleId: number;
  roleName: string;
  firstName: string;
  lastName: string;
  permissions: string[];
}

export interface SessionRecord {
  session_id: number;
  user_id: number;
  refresh_token_hash: string;
  user_agent: string | null;
  ip_address: string | null;
  is_revoked: boolean;
  expires_at: Date;
  created_at: Date;
}

export interface SecurityTokenRecord {
  token_id: number;
  user_id: number;
  token_type: "EMAIL_VERIFICATION" | "PASSWORD_RESET";
  token_hash: string;
  is_used: boolean;
  expires_at: Date;
  created_at: Date;
}

export interface RegisterDTO {
  email: string;
  password: string;
  phoneNumber?: string;
  roleName: "ROLE_TENANT" | "ROLE_PROPERTY_OWNER" | "ROLE_PROPERTY_MANAGER" | "ROLE_VENDOR" | "ROLE_ADMIN";
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponseData {
  user: {
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    roleName: string;
    accountStatus: string;
    permissions: string[];
  };
  accessToken: string;
}
