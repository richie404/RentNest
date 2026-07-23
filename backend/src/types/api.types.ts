export interface ApiResponseEnvelope<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
  error?: ApiErrorEnvelope;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiErrorEnvelope {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  path?: string;
  correlationId?: string;
}
