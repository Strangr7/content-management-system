import { asyncHandler } from "../utils/asyncHandler.js";
import Cart from "../models/cart.models.js";
import { APIError } from "../utils/apiError.js";
import logger from "../utils/logger.js";
import { APIResponse } from "../utils/apiResponse.js"; 
import Product from "../models/product.models.js";

// Fetch cart
const getCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  logger.info(`Fetching cart for userId: ${userId}`);

  if (!userId) {
    throw new APIError(400, "User ID not found");
  }

  const cart = await Cart.findOne({ user: userId }).populate("items.product");

  if (!cart) {
    throw new APIError(404, "Cart not found");
  }

  res.status(200).json(new APIResponse(200, cart, "Cart fetched successfully"));
});

// Add to cart function
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  if (!productId || !quantity || quantity <= 0) {
    throw new APIError(400, "Product ID and quantity are required and quantity should be greater than 0");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new APIError(404, "Product not found");
  }

  // Check stock availability
  if (product.total_number < quantity) {
    throw new APIError(400, "Insufficient stock");
  }

  // Deduct the quantity from product stock
  product.total_number -= quantity;
  await product.save();

  const price = product.price;

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = new Cart({
      user: userId,
      items: [{ product: productId, quantity, price }],
    });
  } else {
    const productInCart = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (productInCart) {
      productInCart.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, price });
    }
  }

  cart.totalPrice = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  await cart.save();

  logger.info(`Product ${productId} added to the cart for user ${userId}`);
  res.status(200).json(new APIResponse(200, cart, "Product added to cart successfully"));
});

// Update cart
const updateCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  if (quantity === undefined || quantity < 0) {
    throw new APIError(400, "Quantity is required and should be 0 or greater");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new APIError(404, "Product not found");
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new APIError(404, "Cart not found");
  }

  const productInCart = cart.items.find(
    (item) => item.product.toString() === productId
  );
  if (!productInCart) {
    throw new APIError(404, "Product not in cart");
  }

  // Calculate the difference in quantity
  const previousQuantity = productInCart.quantity;
  const quantityDifference = quantity - previousQuantity;

  // If quantity is updated to 0, remove the item from cart
  if (quantity === 0) {
    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
  } else {
    // Update the product quantity in the cart
    productInCart.quantity = quantity;
  }

  // Adjust the stock in the product collection
  if (quantityDifference > 0) {
    if (product.total_number < quantityDifference) {
      throw new APIError(400, "Insufficient stock");
    }
    product.total_number -= quantityDifference;
  } else {
    product.total_number += Math.abs(quantityDifference); // Return stock if quantity decreases
  }

  await product.save();

  // Recalculate the total price for the cart
  cart.totalPrice = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  await cart.save();

  res.status(200).json(new APIResponse(200, cart, "Cart updated successfully"));
});

// Clear cart
const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new APIError(404, "Cart not found");
  }

  // Restore the total_number for each product in the cart
  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    if (product) {
      product.total_number += item.quantity;
      await product.save();
    }
  }

  cart.items = [];
  cart.totalPrice = 0;

  await cart.save();

  res.status(200).json(new APIResponse(200, cart, "Cart cleared successfully"));
});

export { getCart, addToCart, updateCart, clearCart };
