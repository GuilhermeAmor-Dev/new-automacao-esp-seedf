import winston from "winston";

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

export function logActivity(
  userId: string,
  action: string,
  target: string,
  details?: string
) {
  logger.info("User activity", {
    userId,
    action,
    target,
    details,
    timestamp: new Date().toISOString(),
  });
}
