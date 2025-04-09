import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Image, Button, Card, ListGroup, Badge } from 'react-bootstrap';
import Webnavbar from './webnavbar';
import Footer from './footer';
import { useNavigate } from 'react-router-dom';

const ProductDetails = () => {

   const navigate = useNavigate();
 

  const { id } = useParams();
  const [mainImage, setMainImage] = useState(0);

  // Sample product data (replace with API call)
  const product = {
    id: id,
    name: `4K Ultra HD Smart TV ${id}`,
    price: 899.99,
    description: "Experience crystal-clear picture quality with our premium 4K UHD Smart TV",
    images: [
      'https://dummyimage.com/800x600/ccc/fff',
      'https://dummyimage.com/800x600/ddd/fff',
      'https://dummyimage.com/800x600/eee/fff'
    ],
    features: [
      '65" 4K UHD Display',
      'HDR10+ & Dolby Vision',
      'Smart TV Platform',
      'Voice Remote Control',
      '4 HDMI Ports'
    ],
    specs: {
      brand: 'TelSet',
      screenSize: '65"',
      resolution: '3840 x 2160',
      refreshRate: '120Hz',
      smartOS: 'Android TV'
    }
  };

  return (
    <>
    <Webnavbar/>
   
    <Container className="my-5">
       
  

      <Row className="g-4">
        {/* Product Images Column */}
        <Col md={6}>
          <div className="sticky-top" style={{ top: '20px' }}>
            <Image 
              src={product.images[mainImage]} 
              fluid 
              className="rounded shadow mb-3"
              alt="Main product"
            />
            <div className="d-flex gap-2">
              {product.images.map((img, index) => (
                <Image
                  key={index}
                  src={img}
                  thumbnail
                  className={`cursor-pointer ${index === mainImage ? 'border-primary' : ''}`}
                  style={{ width: '100px' }}
                  onClick={() => setMainImage(index)}
                  alt={`Thumbnail ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </Col>

        {/* Product Details Column */}
        <Col md={6}>
          <h1 className="fw-bold mb-3">{product.name}</h1>
          <div className="d-flex align-items-center gap-3 mb-4">
            <h2 className="text-danger">${product.price}</h2>
            <Badge bg="success" className="fs-6">In Stock</Badge>
          </div>

          <div className="d-grid gap-3 d-md-block mb-4">
            <Button variant="danger" size="lg" className="me-2" onClick={()=> navigate('/webpages/addtocart')}>
              Add to Cart
            </Button>
            <Button variant="outline-dark" size="lg">
              Buy Now
            </Button>
          </div>

          {/* Features Card */}
          <Card className="mb-4">
            <Card.Body>
              <Card.Title className="h4">Key Features</Card.Title>
              <ListGroup variant="flush">
                {product.features.map((feature, index) => (
                  <ListGroup.Item key={index} className="d-flex align-items-center">
                    <span className="text-success me-2">✔</span>
                    {feature}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>

          {/* Specifications Card */}
          <Card>
            <Card.Body>
              <Card.Title className="h4">Technical Specifications</Card.Title>
              <Row>
                {Object.entries(product.specs).map(([key, value]) => (
                  <Col md={6} key={key} className="mb-3">
                    <div className="d-flex justify-content-between border-bottom pb-2">
                      <span className="text-muted">{key}</span>
                      <span className="fw-semibold">{value}</span>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Related Products Section */}
      <section className="mt-5">
        <h2 className="mb-4">Related Products</h2>
        <Row className="g-4">
          {[1, 2, 3, 4].map((item) => (
            <Col md={3} key={item}>
              <Card className="h-100 shadow-sm">
                <Card.Img 
                  variant="top" 
                  src="https://dummyimage.com/300x200/eee/000" 
                  alt={`Related product ${item}`}
                />
                <Card.Body className="text-center">
                  <Card.Title>TV Model {item}</Card.Title>
                  <Card.Text className="text-danger fw-bold">${699 + item * 100}</Card.Text>
                  <Button 
                    as={Link} 
                    to={`/products/${item}`} 
                    variant="outline-dark"
                  >
                    View Details
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </section>
    </Container>
    <Footer/>
    </>
  );
};

export default ProductDetails;