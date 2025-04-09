import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import {Container,Button,Card,Row,Col,} from "react-bootstrap";
import Webnavbar from "./webnavbar";
import Footer from "./footer";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Navbar */}
     <Webnavbar/>

      {/* Header */}
      <header className="bg-primary py-5 text-white text-center">
        <Container>
          <h1 className="display-4 fw-bolder">Television is the Information</h1>
          <p className="lead fw-normal text-white-50 mb-0">With this shop homepage template</p>
        </Container>
      </header>

      {/* Product Section */}
      <section className="py-5">
        <Container>
        <div className="row row-cols-1 row-cols-md-3 g-4">
            {(() => {
              const productCards = [];
              for (let i = 1; i <= 6; i++) {
                productCards.push(
                  <div className="col" key={i}>
                    <Card className="h-100">
                      <Card.Img variant="top" src="https://dummyimage.com/450x300/dee2e6/6c757d.jpg" alt="Product" />
                      <Card.Body className="text-center">
                        <Card.Title>Product {i}</Card.Title>
                        <Card.Text>$40.00 - $80.00</Card.Text>
                      </Card.Body>
                      <Card.Footer className="text-center">
                        <Button variant="outline-dark" onClick={()=> navigate('/webpages/productdetails')}>Product Details</Button>
                      </Card.Footer>
                    </Card>
                  </div>
                );
              }
              return productCards;
            })()}
        </div>
        </Container>
      </section>

      {/* Services Section */}
      <section className="py-5 bg-secondary text-center">
        <Container>
          <h2 className="mb-4">Our Services</h2>
          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <h5 className="fw-bold">Free Delivery</h5>
                  <p>Fast and free shipping on all orders over $50.</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <h5 className="fw-bold">24/7 Support</h5>
                  <p>Our customer service team is always available for your help.</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <h5 className="fw-bold">1-Year Warranty</h5>
                  <p>All televisions come with a standard 1-year warranty.</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section className="py-5 text-center bg-white">
        <Container>
          <h2 className="mb-4">What Our Customers Say</h2>
          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100">
                <Card.Body>
                  <p>"Amazing picture quality and fast delivery. Highly recommend!"</p>
                  <h6 className="fw-bold mb-0">– John D.</h6>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100">
                <Card.Body>
                  <p>"Great customer service and easy to navigate website."</p>
                  <h6 className="fw-bold mb-0">– Sarah K.</h6>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100">
                <Card.Body>
                  <p>"The smart features are fantastic! Worth every penny."</p>
                  <h6 className="fw-bold mb-0">– Ahmed R.</h6>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Contact CTA Section */}
      <section className="py-5 bg-dark text-white text-center">
        <Container>
          <h2>Need Help or Have Questions?</h2>
          <p className="lead">Reach out to our expert team anytime. We're here to help!</p>
          <Button variant="outline-light" size="lg" as={Link} to="/webpages/contact">Contact Us</Button>
        </Container>
      </section>

      {/* Footer */}
      <Footer/>
    </div>
  );
};

export default Index;


