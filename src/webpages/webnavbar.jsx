import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Navbar,
  Nav,
  Container,
  NavDropdown,
  Button,
} from "react-bootstrap";

const Webnavbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    setUser(null);
    navigate("/webpages/login");
  };

  return (
    <Navbar bg="light" expand="lg" className="navbar-light shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/">TelSet</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/webpages/aboutus">About</Nav.Link>
            <NavDropdown title="Television" id="basic-nav-dropdown">
              <NavDropdown.Item as={Link} to="/webpages/allproduct">All Products</NavDropdown.Item>
            </NavDropdown>
          </Nav>

          <div className="d-flex gap-2 align-items-center">
            {!user ? (
              <>
                <Button variant="outline-primary" onClick={() => navigate('/webpages/login')}>Login</Button>
                <Button variant="outline-success" onClick={() => navigate('/webpages/signup')}>Signup</Button>
                <Button
                  variant="outline-dark"
                  onClick={() => navigate('/webpages/addtocart')}
                >
                  🛒 Cart
                  <span className="badge bg-dark text-white ms-1 rounded-pill">
                    {/* {JSON.parse(localStorage.getItem("cart"))?.length || 0} */}
                  </span>
                </Button>
              </>
            ) : (
              <>
                <NavDropdown title={user.first_name || "User"} id="user-nav-dropdown">
                  <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/webpages/orders">Products Bought</NavDropdown.Item>
                </NavDropdown>
                <Button
                  variant="outline-dark"
                  onClick={() => navigate('/webpages/addtocart')}
                >
                  🛒 Cart
                  <span className="badge bg-dark text-white ms-1 rounded-pill">
                    {JSON.parse(localStorage.getItem("cart"))?.length || 0}
                  </span>
                </Button>
               
              </>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Webnavbar;
