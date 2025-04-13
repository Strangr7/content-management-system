import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Image, Button, Card, ListGroup, Badge } from 'react-bootstrap';
import Webnavbar from './webnavbar';
import Footer from './footer';
import axios from 'axios';

const ProductDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:5000/api/product/${id}`)
      .then((response) => {
        setProduct(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load product details');
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/product`)
      .then((response) => {
        setRelatedProducts(response.data.slice(0, 4));
      })
      .catch(() => {
        setError('Failed to load related products');
      });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const handleAddToCart = () => {
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];

    const isAlreadyInCart = existingCart.find(item => item.id === product._id);
    if (!isAlreadyInCart) {
      const newItem = {
        id: product._id,
        name: product.product_name,
        price: parseFloat(product.price),
        quantity: 1,
      };
      const updatedCart = [...existingCart, newItem];
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    }

    navigate('/webpages/addtocart');
  };

  return (
    <>
      <Webnavbar />
      <Container className="my-5">
        <Row className="g-4">
          <Col md={6}>
            <div className="sticky-top" style={{ top: '20px' }}>
              <Image
                src={product.image ? `http://localhost:5000${product.image}` : "https://via.placeholder.com/300x300?text=No+Image+Available"}
                fluid
                className="rounded shadow mb-3"
                alt="Product"
              />
            </div>
          </Col>

          <Col md={6}>
            <h1 className="fw-bold mb-3">{product.product_name}</h1>
            <div className="d-flex align-items-center gap-3 mb-4">
              <h2 className="text-danger">${product.price}</h2>
              <Badge bg={product.stock > 0 ? 'success' : 'danger'} className="fs-6">
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </Badge>
            </div>

            <div className="d-grid gap-3 d-md-block mb-4">
              <Button
                variant="danger"
                size="lg"
                className="me-2"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                Add to Cart
              </Button>
            </div>

            <Card className="mb-4">
              <Card.Body>
                <Card.Title className="h4">Key Features</Card.Title>
                <ListGroup variant="flush">
                  {[
                    { label: "Screen Size", value: product.screen_size },
                    { label: "Resolution", value: product.resolution },
                    { label: "Display Type", value: product.display_type },
                    { label: "Smart TV", value: product.smart_tv ? "Yes" : "No" },
                  ].map((feature, index) => (
                    feature.value && (
                      <ListGroup.Item key={index}>
                        <span className="text-success me-2">✔</span>
                        <strong>{feature.label}:</strong> {feature.value}
                      </ListGroup.Item>
                    )
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>

            <Card>
              <Card.Body>
                <Card.Title className="h4">Technical Specifications</Card.Title>
                <Row>
                  <Col md={6} className="mb-3">
                    <div className="d-flex justify-content-between border-bottom pb-2">
                      <span className="text-muted">Resolution</span>
                      <span className="fw-semibold">{product.resolution}</span>
                    </div>
                  </Col>
                  <Col md={6} className="mb-3">
                    <div className="d-flex justify-content-between border-bottom pb-2">
                      <span className="text-muted">Size</span>
                      <span className="fw-semibold">{product.screen_size}</span>
                    </div>
                  </Col>
                  <Col md={6} className="mb-3">
                    <div className="d-flex justify-content-between border-bottom pb-2">
                      <span className="text-muted">Smart OS</span>
                      <span className="fw-semibold">Android OS</span>
                    </div>
                  </Col>
                  <Col md={6} className="mb-3">
                    <div className="d-flex justify-content-between border-bottom pb-2">
                      <span className="text-muted">Manufacturer Date</span>
                      <span className="fw-semibold">{product.manufacture_date}</span>
                    </div>
                  </Col>
                  <Col md={6} className="mb-3">
                    <div className="d-flex justify-content-between border-bottom pb-2">
                      <span className="text-muted">HDMI Port</span>
                      <span className="fw-semibold">1 HDMI</span>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <section className="mt-5">
          <h2 className="mb-4">Related Products</h2>
          <Row className="g-4">
            {relatedProducts.length > 0 ? (
              relatedProducts.map((item, index) => (
                <Col md={3} key={item._id || index}>
                  <Card className="h-100 shadow-sm">
                    <Card.Img variant="top" src={item.image ? `http://localhost:5000${item.image}` : "https://dummyimage.com/300x200/eee/000"} />
                    <Card.Body className="text-center">
                      <Card.Title>{item.product_name}</Card.Title>
                      <Card.Text className="text-danger fw-bold">${item.price}</Card.Text>
                      <Button as={Link} to={`/products/${item.product_id}`} variant="outline-dark">
                        View Details
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <p>No related products available.</p>
            )}
          </Row>
        </section>
      </Container>
      <Footer />
    </>
  );
};

export default ProductDetails;
