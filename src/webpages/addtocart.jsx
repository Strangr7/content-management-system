import React from "react";
import Webnavbar from "./webnavbar";
import Footer from "./footer";

const Addtocart = () => {
  const cartItems = [
    { id: 1, name: "T-shirt", price: 20, quantity: 2 },
    { id: 2, name: "Sneakers", price: 60, quantity: 1 },
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.13;
  const total = subtotal + tax;

  return (
    <>
      <Webnavbar />
      <div className="container py-5" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
        <div className="row">
          {/* Cart Items - Left */}
          <div className="col-md-8 mb-4">
            <h2 className="mb-4">Your Cart</h2>
            {cartItems.map((item) => (
              <div key={item.id} className="card shadow-sm mb-3">
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="card-title mb-1">{item.name}</h5>
                    <p className="card-text mb-0">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-end">
                    <p className="mb-1 fw-bold">${item.price * item.quantity}</p>
                    <button className="btn btn-danger btn-sm">Remove</button>
                  </div>
                </div>
              </div>
            ))}
            <button className="btn btn-primary mt-3">Add More Items</button>
          </div>

          {/* Payment Summary - Right */}
          <div className="col-md-4">
            <div className="card shadow sticky-top" style={{ top: "1rem" }}>
              <div className="card-body">
                <h4 className="card-title mb-4">Payment Summary</h4>
                <ul className="list-group list-group-flush mb-3">
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Tax (13%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between fw-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </li>
                </ul>
                <button className="btn btn-success w-100">Proceed to Payment</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default Addtocart;
