import { asyncHandler } from "../utils/asyncHandler.js";
import Cart from "../models/cart.models.js";
import Order from "../models/order.models.js";
import Payment from "../models/payment.models.js";
import Product from "../models/product.models.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";

// Metrics logging (reused from cart.controller.js)
const metrics = {
  cartOperations: 0,
  cartSizeSum: 0,
  cartCount: 0,
  cartAbandonments: 0,

  logOperation: function () {
    this.cartOperations++;
    logger.info(`Total cart operations: ${this.cartOperations}`);
  },

  logCartSize: function (size) {
    this.cartSizeSum += size;
    this.cartCount++;
    const averageCartSize = this.cartSizeSum / this.cartCount;
    logger.info(`Average cart size: ${averageCartSize.toFixed(2)} items`);
  },

  logAbandonment: function () {
    this.cartAbandonments++;
    logger.info(`Total cart abandonments: ${this.cartAbandonments}`);
  },
};

// Helper function to handle expired carts (reused from cart.controller.js)
const handleExpiredCart = async (cart, session) => {
  if (cart.expiresAt && cart.expiresAt < new Date()) {
    logger.info(`Cart for user ${cart.user} has expired. Restoring stock and clearing cart.`);

    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { total_number: item.quantity } },
        { new: true, session }
      );
    }

    cart.items = [];
    cart.subtotal = 0;
    cart.totalDiscount = 0;
    cart.tax = 0;
    cart.total = 0;
    cart.coupon = null;
    cart.couponDiscount = 0;
    cart.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    metrics.logAbandonment();
  }
};

// Checkout
const checkout = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { paymentMethod, paymentDetails, shippingAddress } = req.body;

  // Validate inputs
  if (!paymentMethod || !["COD", "Card", "PayPal"].includes(paymentMethod)) {
    throw new APIError(400, "Invalid payment method");
  }

  if (!paymentDetails) {
    throw new APIError(400, "Payment details are required");
  }

  // Validate payment details based on payment method
  if (paymentMethod === "Card") {
    if (!paymentDetails.cardNumber || !paymentDetails.expiry || !paymentDetails.cvc) {
      throw new APIError(400, "Card number, expiry, and CVC are required for Card payment");
    }
  } else if (paymentMethod === "PayPal") {
    if (!paymentDetails.email) {
      throw new APIError(400, "PayPal email is required for PayPal payment");
    }
  } else if (paymentMethod === "COD") {
    if (!paymentDetails.confirmation) {
      throw new APIError(400, "COD confirmation is required");
    }
  }

  if (
    !shippingAddress ||
    !shippingAddress.street ||
    !shippingAddress.city ||
    !shippingAddress.state ||
    !shippingAddress.zip ||
    !shippingAddress.country
  ) {
    throw new APIError(400, "Complete shipping address is required");
  }

  const maxRetries = 3;
  let attempt = 0;
  let newOrder, newPayment;

  while (attempt < maxRetries) {
    const session = await mongoose.startSession();
    let transactionCommitted = false;

    try {
      session.startTransaction({
        readConcern: { level: "snapshot" },
        writeConcern: { w: "majority" },
        maxTimeMS: 10000,
      });

      // Fetch cart
      let cart = await Cart.findOne({ user: userId }).populate("items.product").session(session);
      if (!cart || cart.items.length === 0) {
        throw new APIError(400, "Cart is empty");
      }

      // Check for expiration
      await handleExpiredCart(cart, session);

      // Check stock availability
      for (let item of cart.items) {
        const product = item.product;
        if (!product || product.status !== "active" || product.deletedAt) {
          throw new APIError(404, `Product ${item.product?.product_name || "unknown"} not found or unavailable`);
        }
        if (product.total_number < item.quantity) {
          throw new APIError(
            400,
            `Not enough stock for ${product.product_name}. Available: ${product.total_number}, Requested: ${item.quantity}`
          );
        }
      }

      // Use cart totals
      const { subtotal, totalDiscount, tax, total } = cart;

      // Create order
      newOrder = new Order({
        user: userId,
        items: cart.items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
        })),
        subtotal,
        totalDiscount,
        tax,
        totalAmount: total,
        paymentMethod,
        shippingAddress,
        status: "Paid",
      });

      await newOrder.save({ session });

      // Create payment record
      newPayment = new Payment({
        order: newOrder._id,
        paymentMethod,
        paymentDetails,
        status: "Completed",
        amount: total,
      });

      await newPayment.save({ session });

      // Link payment to order
      newOrder.payment = newPayment._id;
      await newOrder.save({ session });

      // Reduce stock since payment is successful
      for (let item of cart.items) {
        const product = await Product.findOneAndUpdate(
          { _id: item.product._id, total_number: { $gte: item.quantity } },
          { $inc: { total_number: -item.quantity } },
          { new: true, session }
        );
        if (!product) {
          throw new APIError(400, `Failed to update stock for product ${item.product.product_name}`);
        }
      }

      // Clear cart
      cart.items = [];
      cart.subtotal = 0;
      cart.totalDiscount = 0;
      cart.tax = 0;
      cart.total = 0;
      cart.coupon = null;
      cart.couponDiscount = 0;
      cart.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await cart.save({ session });

      // Commit the transaction
      await session.commitTransaction();
      transactionCommitted = true;

      break;
    } catch (error) {
      if (!transactionCommitted) {
        await session.abortTransaction();
      }
      attempt++;

      if (attempt === maxRetries) {
        throw error;
      }

      logger.warn(`Retrying transaction for checkout (attempt ${attempt}/${maxRetries}) due to error: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      session.endSession();
    }
  }

  // Post-transaction operations
  metrics.logOperation();
  metrics.logCartSize(0);

  return res.status(201).json(
    new APIResponse(201, { order: newOrder, payment: newPayment }, "Order placed successfully")
  );
});

// Fetch all orders for the user with pagination
const fetchAllOrders = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("items.product", "product_name price discount images")
    .populate("payment");

  const totalOrders = await Order.countDocuments({ user: userId });

  if (!orders || orders.length === 0) {
    throw new APIError(404, "No orders found");
  }

  return res.status(200).json(
    new APIResponse(
      200,
      {
        orders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalOrders / limit),
          totalOrders,
          limit,
        },
      },
      "Orders fetched successfully"
    )
  );
});

// Fetch a single order by orderNumber for the user
const fetchOrderByNumber = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { orderNumber } = req.params;

  const order = await Order.findOne({ user: userId, orderNumber })
    .populate("items.product", "product_name price discount images")
    .populate("payment");

  if (!order) {
    throw new APIError(404, "Order not found");
  }

  return res.status(200).json(new APIResponse(200, order, "Order fetched successfully"));
});

// Update order status for the user
const updateOrderStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { orderNumber } = req.params;
  const { status } = req.body;

  if (
    !status ||
    !["Pending Payment", "Awaiting Payment", "Paid", "Shipped", "Delivered", "Cancelled"].includes(status)
  ) {
    throw new APIError(400, "Invalid status");
  }

  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    const session = await mongoose.startSession();
    session.startTransaction({
      readConcern: { level: "snapshot" },
      writeConcern: { w: "majority" },
      maxTimeMS: 10000,
    });

    try {
      const order = await Order.findOne({ user: userId, orderNumber }).session(session);
      if (!order) {
        throw new APIError(404, "Order not found");
      }

      const previousStatus = order.status;
      order.status = status;

      // Handle stock updates based on status changes
      if (status === "Paid" && previousStatus !== "Paid") {
        for (let item of order.items) {
          const product = await Product.findOneAndUpdate(
            { _id: item.product, total_number: { $gte: item.quantity } },
            { $inc: { total_number: -item.quantity } },
            { new: true, session }
          );
          if (!product) {
            throw new APIError(400, `Failed to update stock for product ${item.product}`);
          }
        }
      } else if (status === "Cancelled" && previousStatus !== "Cancelled") {
        for (let item of order.items) {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { total_number: item.quantity } },
            { new: true, session }
          );
        }
      }

      await order.save({ session });

      await session.commitTransaction();

      metrics.logOperation();

      return res.status(200).json(new APIResponse(200, order, "Order status updated successfully"));
    } catch (error) {
      await session.abortTransaction();
      attempt++;

      if (attempt === maxRetries) {
        throw error;
      }

      logger.warn(`Retrying transaction for updateOrderStatus (attempt ${attempt}/${maxRetries}) due to error: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      session.endSession();
    }
  }
});

// Admin: Fetch all orders with pagination
const fetchAllOrdersAdmin = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Log the query parameters for debugging
  logger.info(`Fetching all orders: page=${page}, limit=${limit}, skip=${skip}`);

  // Fetch total number of orders first
  const totalOrders = await Order.countDocuments();
  logger.info(`Total orders in database: ${totalOrders}`);

  // Validate pagination: if page is too high, adjust it or return an empty result with a message
  if (skip >= totalOrders && totalOrders > 0) {
    logger.info(`Page ${page} exceeds total orders (${totalOrders}). Returning empty result.`);
    return res.status(200).json(
      new APIResponse(
        200,
        {
          orders: [],
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalOrders / limit),
            totalOrders,
            limit,
          },
        },
        `No orders found on page ${page}. Total orders: ${totalOrders}.`
      )
    );
  }

  // Fetch orders
  const orders = await Order.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("user", "email firstName lastName")
    .populate("items.product", "product_name price discount images")
    .populate("payment");

  logger.info(`Orders found: ${orders.length}`);

  // If no orders exist in the database at all, return a 404
  if (totalOrders === 0) {
    throw new APIError(404, "No orders exist in the database");
  }

  // If orders exist but none are found on this page, we already handled it above
  // This condition should now be unreachable due to the pagination check
  if (!orders || orders.length === 0) {
    throw new APIError(404, "No orders found on this page");
  }

  return res.status(200).json(
    new APIResponse(
      200,
      {
        orders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalOrders / limit),
          totalOrders,
          limit,
        },
      },
      "All orders fetched successfully"
    )
  );
});

// Admin: Fetch a single order by orderNumber
const fetchOrderByNumberAdmin = asyncHandler(async (req, res) => {
  const { orderNumber } = req.params;

  const order = await Order.findOne({ orderNumber })
    .populate("user", "email firstName lastName")
    .populate("items.product", "product_name price discount images")
    .populate("payment");

  if (!order) {
    throw new APIError(404, "Order not found");
  }

  return res.status(200).json(new APIResponse(200, order, "Order fetched successfully"));
});

// Admin: Update order status for any order
const updateOrderStatusAdmin = asyncHandler(async (req, res) => {
  const { orderNumber } = req.params;
  const { status } = req.body;

  if (
    !status ||
    !["Pending Payment", "Awaiting Payment", "Paid", "Shipped", "Delivered", "Cancelled"].includes(status)
  ) {
    throw new APIError(400, "Invalid status");
  }

  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    const session = await mongoose.startSession();
    session.startTransaction({
      readConcern: { level: "snapshot" },
      writeConcern: { w: "majority" },
      maxTimeMS: 10000,
    });

    try {
      const order = await Order.findOne({ orderNumber }).session(session);
      if (!order) {
        throw new APIError(404, "Order not found");
      }

      const previousStatus = order.status;
      order.status = status;

      // Handle stock updates based on status changes
      if (status === "Paid" && previousStatus !== "Paid") {
        for (let item of order.items) {
          const product = await Product.findOneAndUpdate(
            { _id: item.product, total_number: { $gte: item.quantity } },
            { $inc: { total_number: -item.quantity } },
            { new: true, session }
          );
          if (!product) {
            throw new APIError(400, `Failed to update stock for product ${item.product}`);
          }
        }
      } else if (status === "Cancelled" && previousStatus !== "Cancelled") {
        for (let item of order.items) {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { total_number: item.quantity } },
            { new: true, session }
          );
        }
      }

      await order.save({ session });

      await session.commitTransaction();

      metrics.logOperation();

      return res.status(200).json(new APIResponse(200, order, "Order status updated successfully"));
    } catch (error) {
      await session.abortTransaction();
      attempt++;

      if (attempt === maxRetries) {
        throw error;
      }

      logger.warn(`Retrying transaction for updateOrderStatusAdmin (attempt ${attempt}/${maxRetries}) due to error: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      session.endSession();
    }
  }
});

export {
  checkout,
  fetchAllOrders,
  fetchOrderByNumber,
  updateOrderStatus,
  fetchAllOrdersAdmin,
  fetchOrderByNumberAdmin,
  updateOrderStatusAdmin,
};