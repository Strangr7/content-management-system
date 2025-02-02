import { asyncHandler } from "../utils/asyncHandler.js";
import Cart from "../models/cart.models.js";
import { APIError } from "../utils/apiError.js";
import logger from "../utils/logger.js";
import { APIResponse } from "../utils/apiResponse.js"; // Assuming this is defined
import Product from "../models/product.models.js";

// Fetch cart
const getCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Log userId for debugging purposes, but avoid exposing sensitive information
  logger.info(`Fetching cart for userId: ${userId}`);

  // Ensure userId is present
  if (!userId) {
    throw new APIError(400, "User ID not found");
  }

  const cart = await Cart.findOne({ user: userId }).populate("items.product");

  if (!cart) {
    throw new APIError(404, "Cart not found");
  }

  // Send response using APIResponse
  res.status(200).json(new APIResponse(200, cart, "Cart fetched successfully"));
});

// Add to cart function
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  if (!productId || !quantity || quantity <= 0) {
    throw new APIError(
      400,
      "Product ID and quantity are required and quantity should be greater than 0"
    );
  }

  // Find the product in the database
  const product = await Product.findById(productId);
  if (!product) {
    throw new APIError(404, "Product not found");
  }

  // Get the price of the product
  const price = product.price;

  // Try to find the user's cart
  let cart = await Cart.findOne({ user: userId });

  // If cart doesn't exist, create a new one
  if (!cart) {
    cart = new Cart({
      user: userId,
      items: [{ product: productId, quantity, price }],
    });
  } else {
    // If the cart exists, check if the product is already in the cart
    const productInCart = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (productInCart) {
      // If the product is in the cart, increase its quantity and price
      productInCart.quantity += quantity;
    } else {
      // If the product is not in the cart, add it
      cart.items.push({ product: productId, quantity, price });
    }
  }

  // Recalculate the total price
  cart.totalPrice = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Save the updated cart
  await cart.save();

  // Log the result for debugging
  logger.info(`Product ${productId} added to the cart for user ${userId}`);
  res
    .status(200)
    .json(new APIResponse(200, cart, "Product added to cart successfully"));
});

//update cart
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
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new APIError(404, "Cart not found");
  }
  const productInCart = cart.items.find(
    (item) => item.product.toString() === productId
  );
  if (!productInCart) {
    throw new APIError(404, "Product not in cart");
  }
  if (quantity === 0) {
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );
  } else {
    productInCart.quantity = quantity;
  }
  cart.totalPrice = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  res.status(200).json(new APIResponse(200, cart, "Cart updated successfully"));
});

//clear cart
const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Fetch the user's cart
  const cart = await Cart.findOne({ user: userId });

  // If the cart does not exist, throw an error
  if (!cart) {
    throw new APIError(404, "Cart not found");
  }

  // Clear the items and reset the total price
  cart.items = []; // Reset items to an empty array
  cart.totalPrice = 0; // Reset the total price to 0

  // Save the updated cart to the database
  await cart.save();

  // Respond with the cleared cart
  res.status(200).json(new APIResponse(200, cart, "Cart cleared successfully"));
});

export { getCart, addToCart, updateCart, clearCart };
