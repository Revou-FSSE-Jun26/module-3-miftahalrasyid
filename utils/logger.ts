// src/utils/logger.ts
import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  // Menentukan level log minimum yang akan dicatat
  level: isDevelopment ? 'debug' : 'info',
  
  // Format visual agar log di terminal server mudah dibaca manusia (hanya saat dev)
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'SYS:standard',
        },
      }
    : undefined,
});