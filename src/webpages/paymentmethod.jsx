import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Webnavbar from "./webnavbar";
import Footer from "./footer";

const PaymentMethod = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    // Redirect if not logged in or if the user is an admin
    if (!storedUser || storedUser.role === true) {
      navigate("/webpages/login");
    } else {
      setUser(storedUser);
    }
  }, [navigate]);

  return (
    <>
      {/* Pass user info to the navbar */}
      <Webnavbar user={user} />

      <div className="container py-5" style={{ minHeight: "100vh" }}>
        <h2 className="mb-4">Payment Method</h2>
        <p>Welcome, <strong>{user?.firstname}</strong>! Please enter your payment details below.</p>

        <form className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Cardholder Name</label>
            <input type="text" className="form-control" required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Card Number</label>
            <input type="text" className="form-control" required />
          </div>
          <div className="col-md-3">
            <label className="form-label">Expiry Date</label>
            <input type="text" className="form-control" placeholder="MM/YY" required />
          </div>
          <div className="col-md-3">
            <label className="form-label">CVV</label>
            <input type="text" className="form-control" required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Address</label>
            <input type="text" className="form-control" required />
          </div>
          <div className="col-md-4">
            <label className="form-label">City</label>
            <input type="text" className="form-control" required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Province</label>
            <input type="text" className="form-control" required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Country</label>
            <input type="text" className="form-control" required />
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-success w-100">Pay Now</button>
          </div>
        </form>
      </div>

      <Footer />
    </>
  );
};

export default PaymentMethod;
