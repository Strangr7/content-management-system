import { asyncHandler } from "../utils/asyncHandler.js";
import Cart from "../models/cart.models.js";
import Order from "../models/order.models.js";
import Product from "../models/product.models.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";

const checkout = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { paymentMethod, shippingAddress } = req.body;

  // Fetch cart
  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    throw new APIError(400, "Cart is empty");
  }

  // Check stock availability
  for (let item of cart.items) {
    const product = await Product.findById(item.product._id);
    if (!product)
      throw new APIError(404, `Product ${item.product.name} not found`);
    if (product.stock < item.quantity) {
      throw new APIError(400, `Not enough stock for ${item.product.name}`);
    }
  }

  // Calculate total price
  let totalPrice = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Create order (no payment validation yet)
  const newOrder = await Order.create({
    user: userId,
    items: cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    })),
    totalAmount: totalPrice,
    paymentMethod: paymentMethod || "Pending", // Store selected method, but don’t validate
    shippingAddress,
    status: "Pending Payment",
  });

  // Reduce stock
  for (let item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { stock: -item.quantity },
    });
  }

  // Clear cart
  await Cart.findOneAndUpdate({ user: userId }, { items: [] });

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    order: newOrder,
  });
});

//fetch all orders

const fetchAllOrders = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

  if (!orders || orders.length === 0) {
    throw new APIError(404, "No orders found");
  }
  res
    .status(200)
    .json(new APIResponse(200, orders, "Orders fetched successfully"));
});

export { checkout, fetchAllOrders };
