import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import {Navbar,Nav,Container,} from "react-bootstrap";
const Footer =() =>{
    return(
        <footer className="py-5 bg-info text-white text-center">
        <Container>
          <p className="m-0">Copyright © Your Website 2025</p>
        </Container>
      </footer>
    );
}

export default Footer;