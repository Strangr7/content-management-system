import React from 'react';
import { Navbar, Nav, NavDropdown, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Webnavbar from './webnavbar';
import Footer from './footer';

const AboutUs = () => {
  const navigate = useNavigate();
  return (
    <>
      <Webnavbar/>
      <Container className="my-5">
        
        <div className="text-center mb-5">
          <h1 className="display-4">About TelSet</h1>
          <p className="lead">Your Ultimate Destination for Television Excellence</p>
        </div>

        <div className="row align-items-center">
          <div className="col-md-6">
            <img 
              src="https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85" 
              alt="Television Collection" 
              className="img-fluid rounded shadow"
            />
          </div>
          <div className="col-md-6">
            <h2 className="mb-4">Our Story</h2>
            <p className="text-muted">
              Since 2010, TelSet has been revolutionizing home entertainment by bringing 
              cutting-edge television technology to households worldwide. We specialize 
              in curating the finest selection of televisions, from sleek 4K UHD displays 
              to immersive home theater systems.
            </p>
            <p className="text-muted">
              Our mission is to transform your viewing experience through innovative 
              technology, expert recommendations, and unparalleled customer service. 
              Whether you're a cinephile, sports enthusiast, or casual viewer, we have 
              the perfect screen for your needs.
            </p>
            <div className="mt-4">
              <h3>Why Choose Us?</h3>
              <ul className="list-unstyled">
                <li className="mb-2">✔️ 10+ Years Industry Experience</li>
                <li className="mb-2">✔️ 5000+ Satisfied Customers</li>
                <li className="mb-2">✔️ Free Installation & Setup</li>
                <li className="mb-2">✔️ 5-Year Warranty on All Products</li>
              </ul>
            </div>
          </div>
        </div>
      </Container>

      <Footer/>
    </>
  );
};

export default AboutUs;