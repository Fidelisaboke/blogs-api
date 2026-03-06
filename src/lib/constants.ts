import { requireEnv } from '@/lib/utils';

export const PORT = requireEnv('PORT');
export const API_PREFIX = '/api/v1';
export const BASE_URL = `${requireEnv('BASE_URL')}${API_PREFIX}`;
