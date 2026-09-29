export interface BackendUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  passwordHash?: string;
  location: string;
  district?: string;
  mandal?: string;
  village?: string;
  role: 'farmer' | 'owner' | 'both' | 'admin';
  gender?: 'male' | 'female';
  verified: boolean;
  status: 'active' | 'suspended';
  aadhaarNumber?: string;
  proofFileAttached?: boolean;
  idFileAttached?: boolean;
  createdAt?: string;
  updatedAt?: number;
}

export interface OtpRecord {
  email: string;
  hashedOtp: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  verified: boolean;
  resetToken?: string;
  tokenExpiresAt?: number;
}

export interface CacheEntry {
  reply: string;
  suggestions: string[];
  timestamp: number;
  detectedLanguage?: string;
}
