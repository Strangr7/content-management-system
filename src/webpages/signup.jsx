import React, { useState } from "react";
import axios from "axios";
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Webnavbar from "./webnavbar";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: ""
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/user", formData);

      if (res.status === 201 || res.status === 200) {
        alert("Registration successful!");
        navigate("/webpages/login");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <>
      <Webnavbar />

      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(to right, #43cea2, #185a9d)",
        }}
      >
        <Container>
          <div className="card mx-auto shadow-lg border-0" style={{ maxWidth: "500px" }}>
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h3 className="fw-bold text-primary">Create Your Account</h3>
                <p className="text-muted">Sign up to get started</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="fname" className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="fname"
                      name="first_name"
                      placeholder="John"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lname" className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="lname"
                      name="last_name"
                      placeholder="Doe"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="repeat-password" className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="repeat-password"
                    name="confirm_password"
                    placeholder="••••••••"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="d-grid mb-3">
                  <button type="submit" className="btn btn-success btn-lg">
                    Register New Account
                  </button>
                </div>

                <div className="text-center">
                  <small className="text-muted">
                    Already have an account?{" "}
                    <a href="/webpages/login" className="text-decoration-none text-primary fw-semibold">
                      Log in
                    </a>
                  </small>
                </div>
              </form>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
};

export default Signup;
