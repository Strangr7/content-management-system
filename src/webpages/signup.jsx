import React from "react";
import {  Container } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import Webnavbar from "./webnavbar";

const Signup = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Navbar */}
     <Webnavbar/>

      {/* Signup Form Section */}
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

              <form>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="fname" className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="fname"
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lname" className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="lname"
                      placeholder="Doe"
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
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="repeat-password" className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="repeat-password"
                    placeholder="••••••••"
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
