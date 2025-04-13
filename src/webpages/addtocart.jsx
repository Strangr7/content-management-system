import React, { useState, useEffect } from "react";
import Webnavbar from "./webnavbar";
import Footer from "./footer";
import { useNavigate } from "react-router-dom";

const Addtocart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(storedCart);
  }, []);

  const updateCartInStorage = (updatedItems) => {
    setCartItems(updatedItems);
    localStorage.setItem("cart", JSON.stringify(updatedItems));
  };

  const handleRemoveItem = (id) => {
    const updatedItems = cartItems.filter((item) => item.id !== id);
    updateCartInStorage(updatedItems);
  };

  const handleQuantityChange = (id, type) => {
    const updatedItems = cartItems.map((item) => {
      if (item.id === id) {
        const newQuantity = type === "inc" ? item.quantity + 1 : item.quantity - 1;
        return {
          ...item,
          quantity: newQuantity < 1 ? 1 : newQuantity,
        };
      }
      return item;
    });
    updateCartInStorage(updatedItems);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.13;
  const total = subtotal + tax;

  return (
    <>
      <Webnavbar />
      <div className="container py-5" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
        <div className="row">
          <div className="col-md-8 mb-4">
            <h2 className="mb-4">Your Cart</h2>
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div key={item.id} className="card shadow-sm mb-3">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="card-title mb-1">{item.name}</h5>
                      <div className="d-flex align-items-center">
                        <button
                          className="btn btn-outline-secondary btn-sm me-2"
                          onClick={() => handleQuantityChange(item.id, "dec")}
                        >
                          −
                        </button>
                        <span className="me-2">Quantity: {item.quantity}</span>
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => handleQuantityChange(item.id, "inc")}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="text-end">
                      <p className="mb-1 fw-bold">${(item.price * item.quantity).toFixed(2)}</p>
                      <button className="btn btn-danger btn-sm" onClick={() => handleRemoveItem(item.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>Your cart is empty.</p>
            )}
          </div>

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
                <button className="btn btn-success w-100" onClick={() => navigate('/webpages/paymentmethod')}>
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Addtocart;
