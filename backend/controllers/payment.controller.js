import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/apiError.js";
import Order from "../models/order.models.js";
import paypal from "paypal-rest-sdk";

const createPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) { // Fixed: 'Order' should be 'order'
    throw new APIError(404, `Order not found with id ${orderId}`);
  }
  if (order.status !== "Pending Payment")
    throw new APIError(400, "Order is already paid");

  const paymentJson = {
    intent: "sale",
    payer: { payment_method: "paypal" },
    redirect_urls: {
      return_url: `${process.env.CLIENT_URL}/payment-success?orderId=${order._id}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
    },
    transactions: [
      {
        amount: { total: order.totalAmount.toFixed(2), currency: "USD" },
        description: `Order #${order._id}`,
      },
    ],
  };

  paypal.payment.create(paymentJson, (error, payment) => {
    if (error) {
      console.error(error.response); // Log the full response from PayPal
      throw new APIError(500, error.response, "Paypal payment creation failed");
    } else {
      const approvalUrl = payment.links.find(
        (link) => link.rel === "approval_url"
      ).href;
      res.json({ success: true, approvalUrl });
    }
  });
});

const executePayment = asyncHandler(async (req, res) => {
  const { paymentId, PayerId, orderId } = req.query;

  const executePaymentJson = { payer_id: PayerId };

  paypal.payment.execute(
    paymentId,
    executePaymentJson,
    async (error, payment) => {
      if (error) {
        console.error(error);  // Log the error
        throw new APIError(500, error, "Paypal payment execution failed");
      }
      await Order.findByIdAndUpdate(orderId, { status: "Paid" });
      res.redirect(`${process.env.CLIENT_URL}/order/${orderId}`);
    }
  );
});

export { createPayment, executePayment };
