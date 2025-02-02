import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { errorHandler } from "./middlewares/error.middlewares.js";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import logger from "./utils/logger.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
const morganFormat = ":method :url :status :response-time ms"; // Log method, URL, status, and response time
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        // Parse morgan log message and transform it into a structured log object
        const parts = message.trim().split(" ");
        const logObject = {
          method: parts[0], // HTTP method (e.g., GET, POST)
          url: parts[1], // Request URL
          status: parts[2], // HTTP status code
          responseTime: parseFloat(parts[3]), // Response time in milliseconds
        };
        logger.info(JSON.stringify(logObject)); // Log the request as JSON
      },
    },
  })
);

//routes
app.use("/api/auth", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/review", reviewRoutes);

app.use(errorHandler);
export { app };
