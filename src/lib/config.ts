import { requireEnv } from '@/lib/utils';

export const config = {
    API_PREFIX: '/api/v1',
    PORT: requireEnv('PORT'),
}
