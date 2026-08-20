export { apiRequest } from './client';
export { ApiError } from './errors';
export { loginWithPassword, logout, getMe } from './auth';
export { listAdminWashingPoints, getAdminStats } from './admin';
export type {
  User,
  UserRole,
  TokenPair,
  WashingPointStatus,
  WashingPointCreate,
  AdminWashingPoint,
  AdminWashingPointList,
  AdminStats,
  ApiErrorBody,
} from './types';
