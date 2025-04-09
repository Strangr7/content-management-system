import { asyncHandler } from "../utils/asyncHandler.js";
import Cart from "../models/cart.models.js";
import { APIError } from "../utils/apiError.js";
import logger from "../utils/logger.js";
import { APIResponse } from "../utils/apiResponse.js";
import Product from "../models/product.models.js";
import mongoose from "mongoose";

// Metrics logging (simulated - in production, use a metrics service like Prometheus)
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

// Helper function to calculate totals using aggregation pipeline
const calculateCartTotals = async (cart) => {
  const [result] = await Cart.aggregate([
    { $match: { _id: cart._id } },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.product",
        foreignField: "_id",
        as: "items.product",
      },
    },
    { $unwind: "$items.product" },
    {
      $match: {
        "items.product.status": "active",
        "items.product.deletedAt": null,
      },
    },
    {
      $group: {
        _id: "$_id",
        items: {
          $push: {
            product: "$items.product",
            quantity: "$items.quantity",
            price: "$items.price",
            discount: "$items.discount",
          },
        },
        subtotal: {
          $sum: { $multiply: ["$items.price", "$items.quantity"] },
        },
        totalDiscount: {
          $sum: {
            $multiply: [
              { $multiply: ["$items.price", "$items.quantity"] },
              { $divide: ["$items.discount", 100] },
            ],
          },
        },
      },
    },
    {
      $project: {
        items: 1,
        subtotal: 1,
        totalDiscount: 1,
        total: {
          $subtract: ["$subtotal", "$totalDiscount"],
        },
      },
    },
  ]);

  if (!result) {
    return { subtotal: 0, totalDiscount: 0, total: 0, items: [] };
  }

  // Apply coupon discount and tax
  let { subtotal, totalDiscount, total, items } = result;
  const couponDiscount = cart.couponDiscount || 0;
  const taxRate = 0.1; // 10% tax rate (configurable in production)
  const tax = subtotal * taxRate;

  totalDiscount += couponDiscount;
  total = subtotal - totalDiscount + tax;

  // Update cached totals in the cart
  cart.subtotal = parseFloat(subtotal.toFixed(2));
  cart.totalDiscount = parseFloat(totalDiscount.toFixed(2));
  cart.tax = parseFloat(tax.toFixed(2));
  cart.total = parseFloat(total.toFixed(2));
  cart.items = items.map((item) => ({
    product: item.product._id,
    quantity: item.quantity,
    price: item.price,
    discount: item.discount,
  }));

  return {
    subtotal: cart.subtotal,
    totalDiscount: cart.totalDiscount,
    tax: cart.tax,
    total: cart.total,
  };
};

// Helper function to check and handle expired carts
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
    cart.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Reset expiration

    metrics.logAbandonment();
  }
};

// Fetch cart
const getCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  logger.info(`Fetching cart for userId: ${userId}`);

  if (!userId) {
    throw new APIError(400, "User ID not found");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let cart = await Cart.findOne({ user: userId }).session(session);

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
      await cart.save({ session });
    }

    // Check for expiration
    await handleExpiredCart(cart, session);

    // Clean up invalid items and calculate totals
    await cart.populate({
      path: "items.product",
      select: "product_name price discount images status total_number deletedAt",
    });

    const updatedItems = cart.items
      .map((item) => {
        const product = item.product;
        if (!product || product.status !== "active" || product.deletedAt) {
          logger.warn(`Removing invalid item from cart: ${item.product}`, {
            reason: !product ? "Product not found" : product.status !== "active" ? "Product inactive" : "Product deleted",
          });
          return null;
        }

        const priceChanged = item.price !== product.price;
        const discountChanged = item.discount !== (product.discount || 0);

        return {
          ...item.toObject(),
          priceChanged,
          discountChanged,
          currentPrice: product.price,
          currentDiscount: product.discount || 0,
        };
      })
      .filter((item) => item !== null);

    cart.items = updatedItems.map((item) => ({
      product: item.product,
      quantity: item.quantity,
      price: item.price,
      discount: item.discount,
    }));

    const totals = await calculateCartTotals(cart);
    await cart.save({ session });

    await session.commitTransaction();

    metrics.logOperation();
    metrics.logCartSize(cart.items.length);

    res.status(200).json(
      new APIResponse(200, { cart: { ...cart.toObject(), items: updatedItems }, totals }, "Cart fetched successfully")
    );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// Add to cart
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  if (!productId || !quantity || quantity <= 0) {
    throw new APIError(400, "Product ID and quantity are required, and quantity must be greater than 0");
  }

  if (quantity > 100) {
    throw new APIError(400, "Quantity cannot exceed 100 per item");
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
      const product = await Product.findById(productId)
        .session(session)
        .select("product_name price discount total_number status deletedAt");

      if (!product) {
        throw new APIError(404, "Product not found");
      }

      if (product.status !== "active") {
        throw new APIError(400, "Product is not available for purchase");
      }

      if (product.deletedAt) {
        throw new APIError(400, "Product has been deleted");
      }

      let cart = await Cart.findOne({ user: userId }).session(session);

      if (!cart) {
        cart = new Cart({ user: userId, items: [] });
      }

      // Check for expiration
      await handleExpiredCart(cart, session);

      const productInCart = cart.items.find((item) => item.product.toString() === productId);
      const currentQuantity = productInCart ? productInCart.quantity : 0;
      const newQuantity = currentQuantity + quantity;

      if (product.total_number < newQuantity) {
        throw new APIError(
          400,
          `Insufficient stock for product ${product.product_name}. Available: ${product.total_number}, Requested: ${newQuantity}`
        );
      }

      const updatedProduct = await Product.findOneAndUpdate(
        { _id: productId, total_number: { $gte: newQuantity } },
        { $inc: { total_number: -quantity } },
        { new: true, session }
      );

      if (!updatedProduct) {
        throw new APIError(
          400,
          `Failed to update stock for product ${product.product_name}. Stock may have changed. Available: ${product.total_number}, Requested: ${newQuantity}`
        );
      }

      if (productInCart) {
        productInCart.quantity = newQuantity;
      } else {
        cart.items.push({
          product: productId,
          quantity,
          price: product.price,
          discount: product.discount || 0,
        });
      }

      const totals = await calculateCartTotals(cart);
      await cart.save({ session });

      await session.commitTransaction();

      await cart.populate({
        path: "items.product",
        select: "product_name price discount images status total_number deletedAt",
      });

      const updatedItems = cart.items.map((item) => {
        const product = item.product;
        const priceChanged = item.price !== product.price;
        const discountChanged = item.discount !== (product.discount || 0);

        return {
          ...item.toObject(),
          priceChanged,
          discountChanged,
          currentPrice: product.price,
          currentDiscount: product.discount || 0,
        };
      });

      metrics.logOperation();
      metrics.logCartSize(cart.items.length);

      logger.info(`Product ${productId} added to cart for user ${userId}`);
      return res.status(200).json(
        new APIResponse(200, { cart: { ...cart.toObject(), items: updatedItems }, totals }, "Product added to cart successfully")
      );
    } catch (error) {
      await session.abortTransaction();
      attempt++;

      if (attempt === maxRetries) {
        throw error;
      }

      logger.warn(`Retrying transaction for addToCart (attempt ${attempt}/${maxRetries}) due to error: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      session.endSession();
    }
  }
});

// Update cart
const updateCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  if (quantity === undefined || quantity < 0) {
    throw new APIError(400, "Quantity is required and must be 0 or greater");
  }

  if (quantity > 100) {
    throw new APIError(400, "Quantity cannot exceed 100 per item");
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
      const product = await Product.findById(productId)
        .session(session)
        .select("product_name price discount total_number status deletedAt");

      if (!product) {
        throw new APIError(404, "Product not found");
      }

      if (product.status !== "active") {
        throw new APIError(400, "Product is not available for purchase");
      }

      if (product.deletedAt) {
        throw new APIError(400, "Product has been deleted");
      }

      const cart = await Cart.findOne({ user: userId }).session(session);
      if (!cart) {
        throw new APIError(404, "Cart not found");
      }

      // Check for expiration
      await handleExpiredCart(cart, session);

      const productInCart = cart.items.find((item) => item.product.toString() === productId);
      if (!productInCart) {
        throw new APIError(404, "Product not in cart");
      }

      const previousQuantity = productInCart.quantity;
      const quantityDifference = quantity - previousQuantity;

      if (quantityDifference > 0) {
        if (product.total_number < quantityDifference) {
          throw new APIError(
            400,
            `Insufficient stock for product ${product.product_name}. Available: ${product.total_number}, Requested additional: ${quantityDifference}`
          );
        }
      }

      const updatedProduct = await Product.findOneAndUpdate(
        { _id: productId, total_number: { $gte: quantityDifference > 0 ? quantityDifference : 0 } },
        { $inc: { total_number: -quantityDifference } },
        { new: true, session }
      );

      if (!updatedProduct && quantityDifference > 0) {
        throw new APIError(
          400,
          `Failed to update stock for product ${product.product_name}. Stock may have changed. Available: ${product.total_number}, Requested additional: ${quantityDifference}`
        );
      }

      if (quantity === 0) {
        cart.items = cart.items.filter((item) => item.product.toString() !== productId);
      } else {
        productInCart.quantity = quantity;
      }

      const totals = await calculateCartTotals(cart);
      await cart.save({ session });

      await session.commitTransaction();

      await cart.populate({
        path: "items.product",
        select: "product_name price discount images status total_number deletedAt",
      });

      const updatedItems = cart.items.map((item) => {
        const product = item.product;
        const priceChanged = item.price !== product.price;
        const discountChanged = item.discount !== (product.discount || 0);

        return {
          ...item.toObject(),
          priceChanged,
          discountChanged,
          currentPrice: product.price,
          currentDiscount: product.discount || 0,
        };
      });

      metrics.logOperation();
      metrics.logCartSize(cart.items.length);

      logger.info(`Cart updated for user ${userId}, product ${productId}, new quantity: ${quantity}`);
      return res.status(200).json(
        new APIResponse(200, { cart: { ...cart.toObject(), items: updatedItems }, totals }, "Cart updated successfully")
      );
    } catch (error) {
      await session.abortTransaction();
      attempt++;

      if (attempt === maxRetries) {
        throw error;
      }

      logger.warn(`Retrying transaction for updateCart (attempt ${attempt}/${maxRetries}) due to error: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      session.endSession();
    }
  }
});

// Clear cart
const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

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
      const cart = await Cart.findOne({ user: userId }).session(session);
      if (!cart) {
        throw new APIError(404, "Cart not found");
      }

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

      await cart.save({ session });

      await session.commitTransaction();

      const totals = { subtotal: 0, totalDiscount: 0, tax: 0, total: 0 };

      metrics.logOperation();
      metrics.logCartSize(0);

      logger.info(`Cart cleared for user ${userId}`);
      return res.status(200).json(new APIResponse(200, { cart, totals }, "Cart cleared successfully"));
    } catch (error) {
      await session.abortTransaction();
      attempt++;

      if (attempt === maxRetries) {
        throw error;
      }

      logger.warn(`Retrying transaction for clearCart (attempt ${attempt}/${maxRetries}) due to error: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      session.endSession();
    }
  }
});

const removeItemFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id;

  if (!productId) {
    throw new APIError(400, "Product ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new APIError(400, "Invalid product ID format");
  }

  const maxRetries = 3;
  let attempt = 0;
  let cart, updatedItems, totals;

  while (attempt < maxRetries) {
    const session = await mongoose.startSession();
    session.startTransaction({
      readConcern: { level: "snapshot" },
      writeConcern: { w: "majority" },
      maxTimeMS: 10000,
    });

    try {
      cart = await Cart.findOne({ user: userId }).session(session);
      if (!cart) {
        throw new APIError(404, "Cart not found");
      }

      // Check for expiration
      await handleExpiredCart(cart, session);
      if (cart.items.length === 0) {
        await session.commitTransaction();
        return res.status(200).json(
          new APIResponse(200, { cart, totals: { subtotal: 0, totalDiscount: 0, tax: 0, total: 0 } }, "Cart is empty or has expired")
        );
      }

      const productInCart = cart.items.find((item) => item.product.toString() === productId);
      if (!productInCart) {
        throw new APIError(404, "Product not in cart");
      }

      const quantityToRestore = productInCart.quantity;

      // Verify the product exists and is active
      const product = await Product.findById(productId).session(session);
      if (!product) {
        throw new APIError(404, "Product not found");
      }
      if (product.status !== "active" || product.deletedAt) {
        throw new APIError(400, "Product is not available");
      }

      // Restore stock
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: productId, total_number: { $gte: 0 } },
        { $inc: { total_number: quantityToRestore } },
        { new: true, session }
      );
      if (!updatedProduct) {
        throw new APIError(500, "Failed to restore stock for product");
      }

      // Remove the item from the cart
      cart.items = cart.items.filter((item) => item.product.toString() !== productId);

      // Recalculate totals
      if (cart.items.length === 0) {
        cart.subtotal = 0;
        cart.totalDiscount = 0;
        cart.tax = 0;
        cart.total = 0;
        totals = { subtotal: 0, totalDiscount: 0, tax: 0, total: 0 };
      } else {
        totals = await calculateCartTotals(cart);
        cart.subtotal = totals.subtotal;
        cart.totalDiscount = totals.totalDiscount;
        cart.tax = totals.tax;
        cart.total = totals.total;
      }

      // Save the updated cart
      await cart.save({ session });

      await session.commitTransaction();

      // Repopulate the cart items for the response
      await cart.populate({
        path: "items.product",
        select: "product_name price discount images status total_number deletedAt",
      });

      updatedItems = cart.items.map((item) => {
        const product = item.product;
        const priceChanged = item.price !== product.price;
        const discountChanged = item.discount !== (product.discount || 0);
        return {
          ...item.toObject(),
          priceChanged,
          discountChanged,
          currentPrice: product.price,
          currentDiscount: product.discount || 0,
        };
      });

      break; // Exit the retry loop on success
    } catch (error) {
      await session.abortTransaction();
      attempt++;

      if (attempt === maxRetries) {
        throw error;
      }

      logger.warn(`Retrying transaction for removeItemFromCart (attempt ${attempt}/${maxRetries}) due to error: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      session.endSession();
    }
  }

  metrics.logOperation();
  metrics.logCartSize(cart.items.length);
  logger.info(`Product ${productId} removed from cart for user ${userId}`);
  return res.status(200).json(
    new APIResponse(200, { cart: { ...cart.toObject(), items: updatedItems }, totals }, "Product removed from cart successfully")
  );
});

// Apply coupon to cart
const applyCoupon = asyncHandler(async (req, res) => {
  const { couponCode } = req.body;
  const userId = req.user._id;

  if (!couponCode) {
    throw new APIError(400, "Coupon code is required");
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
      const cart = await Cart.findOne({ user: userId }).session(session);
      if (!cart) {
        throw new APIError(404, "Cart not found");
      }

      // Check for expiration
      await handleExpiredCart(cart, session);

      // Simulated coupon validation (in production, use a Coupon model)
      let couponDiscount = 0;
      if (couponCode === "DISCOUNT10") {
        couponDiscount = cart.subtotal * 0.1; // 10% off
      } else {
        throw new APIError(400, "Invalid coupon code");
      }

      cart.coupon = couponCode;
      cart.couponDiscount = couponDiscount;

      const totals = await calculateCartTotals(cart);
      await cart.save({ session });

      await session.commitTransaction();

      await cart.populate({
        path: "items.product",
        select: "product_name price discount images status total_number deletedAt",
      });

      const updatedItems = cart.items.map((item) => {
        const product = item.product;
        const priceChanged = item.price !== product.price;
        const discountChanged = item.discount !== (product.discount || 0);

        return {
          ...item.toObject(),
          priceChanged,
          discountChanged,
          currentPrice: product.price,
          currentDiscount: product.discount || 0,
        };
      });

      metrics.logOperation();
      metrics.logCartSize(cart.items.length);

      logger.info(`Coupon ${couponCode} applied to cart for user ${userId}`);
      return res.status(200).json(
        new APIResponse(200, { cart: { ...cart.toObject(), items: updatedItems }, totals }, "Coupon applied successfully")
      );
    } catch (error) {
      await session.abortTransaction();
      attempt++;

      if (attempt === maxRetries) {
        throw error;
      }

      logger.warn(`Retrying transaction for applyCoupon (attempt ${attempt}/${maxRetries}) due to error: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      session.endSession();
    }
  }
});

export { getCart, addToCart, updateCart, clearCart, removeItemFromCart, applyCoupon };