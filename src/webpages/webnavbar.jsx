import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import {Navbar,Nav,Container,NavDropdown,Button} from "react-bootstrap";
const Webnavbar = () =>{

    const navigate = useNavigate();
    return(
        <Navbar bg="light" expand="lg" className="navbar-light shadow-sm">
        <Container>
          <Navbar.Brand as={Link} to="/">TelSet</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/webpages/aboutus">About</Nav.Link>
              <NavDropdown title="Television" id="basic-nav-dropdown">
                <NavDropdown.Item href="#all">All Products</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="#">Popular Items</NavDropdown.Item>
                <NavDropdown.Item href="#new">New Arrivals</NavDropdown.Item>
              </NavDropdown>
            </Nav>
            <div className="d-flex gap-2">
              <Button variant="outline-primary" onClick={() => navigate('/webpages/login')}>Login</Button>
              <Button variant="outline-success" onClick={() => navigate('/webpages/signup')}>Signup</Button>
            </div>
            <div className="d-flex gap-2 ms-3">
              <Button variant="outline-dark" onClick={() => navigate('/webpages/addtocart')}>
                🛒 Cart <span className="badge bg-dark text-white ms-1 rounded-pill">0</span>
              </Button>
            </div>
          </Navbar.Collapse>
        </Container>
 </Navbar>

    );
}

export default Webnavbar;