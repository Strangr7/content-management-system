import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import Webnavbar from "./webnavbar";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/user/login", {
        email,
        password,
      });

      const user = res.data;

      // ✅ Save user data to localStorage
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ Redirect based on role
      if (user.role === true) {
        navigate("/dashboard");
      } else {
        navigate("/webpages/paymentmethod");
      }
    } catch (err) {
      setError("Invalid credentials or server error.");
      console.error(err);
    }
  };

  return (
    <>
      <Webnavbar />

      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(to right, #6a11cb, #2575fc)",
        }}
      >
        <Container>
          <div
            className="card mx-auto shadow-lg border-0"
            style={{ maxWidth: "420px" }}
          >
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h3 className="fw-bold text-primary">Welcome Back</h3>
                <p className="text-muted">Please login to your account</p>
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    <a
                      href="/webpages/signup"
                      className="text-decoration-none text-primary fw-semibold"
                    >
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
