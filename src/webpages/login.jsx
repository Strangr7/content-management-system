import React from "react";
import { Navbar, Nav, NavDropdown, Container, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import Webnavbar from "./webnavbar";

const Login = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Navbar */}
      
        <Webnavbar/>
      {/* Login Form Section */}
      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(to right, #6a11cb, #2575fc)",
        }}
      >
        <Container>
          <div className="card mx-auto shadow-lg border-0" style={{ maxWidth: "420px" }}>
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h3 className="fw-bold text-primary">Welcome Back</h3>
                <p className="text-muted">Please login to your account</p>
              </div>

              <form>
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

                <div className="mb-4">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-primary btn-lg">
                    Login
                  </button>
                </div>

                <div className="text-center mt-4">
                  <small className="text-muted">
                    Not registered?{" "}
                    <a href="/webpages/signup" className="text-decoration-none text-primary fw-semibold">
                      Create account
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

export default Login;
