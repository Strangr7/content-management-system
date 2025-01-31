import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";
import logger from "./utils/logger.js";

dotenv.config({});

// Define the port for the server (use PORT from .env or default to 7001)
const PORT = process.env.PORT || 7001;

// Connect to the database and start the server
connectDB()
  .then(() => {
    // Start the server if the database connection is successful
    app.listen(PORT, () => {
    
      logger.info(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    // Log a warning if there is a database connection error
    logger.warn(`MongoDB connection error:`, err);
  });