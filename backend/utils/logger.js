import { createLogger, format, transports } from "winston";
const { combine, timestamp, json, printf, colorize } = format;

// Custom format for console logging with colors and timestamps
const consoleLogFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// Create a Winston logger
const logger = createLogger({
  level: process.env.LOG_LEVEL || "info", // Default to "info" but allow overrides
  format: combine(timestamp(), json()), // JSON format for file logs
  transports: [
    new transports.Console({
      format: combine(colorize(), timestamp(), consoleLogFormat), // Colorized console logs with timestamp
    }),
    new transports.File({ filename: "app.log" }), // File logs in JSON format
  ],
});

export default logger;
