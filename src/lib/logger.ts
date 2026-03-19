import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    ...(isDevelopment ? {
        transport: {
            target: 'pino-pretty',
            options: { colorize: true }
        }
    } : {}),
    redact: [
        'password',
        'token',
        'authorization',
        'cookie',
        'email',
        '**.password',
        '**.token',
        '**.authorization',
        '**.secret',
        '**.apiKey',
        '**.accessToken',
        '**.refreshToken',
        '**.email',
        '**.cookie',
        'req.headers.authorization',
        'req.headers.cookie'
    ]
})

export default logger;
