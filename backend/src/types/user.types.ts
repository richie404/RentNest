export interface UserFilterOptions {
  page?: number;
  limit?: number;
  roleName?: string;
  accountStatus?: "ACTIVE" | "SUSPENDED" | "UNVERIFIED";
  search?: string;
}

export interface UserDetailData {
  userId: number;
  email: string;
  phoneNumber: string | null;
  accountStatus: "ACTIVE" | "SUSPENDED" | "UNVERIFIED";
  createdAt: Date;
  updatedAt: Date;
  profile: {
    profileId: number;
    firstName: string;
    lastName: string;
    dateOfBirth: Date | null;
    avatarUrl: string | null;
    emergencyContactJson: any;
  } | null;
  roles: {
    roleId: number;
    roleName: string;
    description: string | null;
  }[];
}

export interface UpdateProfileDTO {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  emergencyContactJson?: any;
}

export interface UpdateUserStatusDTO {
  status: "ACTIVE" | "SUSPENDED" | "UNVERIFIED";
}
