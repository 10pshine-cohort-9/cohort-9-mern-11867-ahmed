import pino from 'pino';

const logger = pino({
  redact: ['req.headers.authorization'],
  ...(process.env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
      },
    },
  }),
});

export default logger;
