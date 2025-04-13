import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Card, Row, Col, Container } from "react-bootstrap";
import axios from "axios";
import Webnavbar from "./webnavbar";
import Footer from "./footer";

const Index = () => {
  const [home, setHomedata] = useState({ title: "", description: "" });
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch homepage entries and pick the latest one
    axios.get("http://localhost:5000/api/homepage")
      .then((res) => {
        const allHomeData = res.data;
  
        // Assuming the entries are not sorted — sort by createdAt or _id
        const latest = allHomeData
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]; // Use _id if no createdAt
  
        if (latest) {
          setHomedata(latest);
        }
      })
      .catch((err) => {
        console.error("Error fetching homepage data:", err);
      });
  
    // Fetch product data
    axios.get("http://localhost:5000/api/product")
      .then((response) => {
        const latestProducts = response.data.slice(0, 8);
        setProducts(latestProducts);
      })
      .catch((err) => {
        console.error("Error fetching product data:", err);
        setError("Failed to load product data");
      });
  }, []);
  
  return (
    <div>
      {/* Navbar */}
      <Webnavbar />

      {/* Header */}
      <header className="bg-primary py-5 text-white text-center">
        <Container>
          <h1 className="display-4 fw-bolder">{home?.title || "Welcome to Our Store"}</h1>
          <p className="lead fw-normal text-white-50 mb-0">
            {home?.description || "Check out our latest products."}
          </p>
        </Container>
      </header>

      {/* Product Section */}
      <section className="py-5">
        <Container>
          <div className="row row-cols-1 row-cols-md-3 g-4">
            {products.length > 0 ? (
              products.map((product) => (
                <div className="col" key={product._id}>
                  <Card className="h-100">
                    <Card.Img
                      variant="top"
                      src={`http://localhost:5000${product.image}`}
                      alt={product.name}
                    />
                    <Card.Body className="text-center">
                      <Card.Title>{product.product_name}</Card.Title>
                      <Card.Text>{`$${product.price}`}</Card.Text>
                    </Card.Body>
                    <Card.Footer className="text-center">
                      <Button
                        variant="outline-dark"
                        onClick={() => navigate(`/webpages/productdetails/${product._id}`)}
                      >
                        Product Details
                      </Button>
                    </Card.Footer>
                  </Card>
                </div>
              ))
            ) : (
              <div className="col-12 text-center">
                <p>{error ? error : "No products available at the moment."}</p>
              </div>
            )}
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
          <Button variant="outline-light" size="lg" as={Link} to="/webpages/contact">
            Contact Us
          </Button>
        </Container>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
