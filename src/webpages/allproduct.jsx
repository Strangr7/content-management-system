import React, { useEffect, useState } from "react";
import { Container, Card, Button, Nav, Pagination } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Webnavbar from "./webnavbar";
import Footer from "./footer";

const AllProduct = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 3;

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/product")
      .then((response) => {
        setProducts(response.data);
        setFilteredProducts(response.data);
      })
      .catch((err) => {
        console.error("Error fetching product data:", err);
        setError("Failed to load product data");
      });
  }, []);

  const handleTabSelect = (category) => {
    setActiveTab(category);
    setCurrentPage(1);

    if (category === "All") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) =>
        product.category?.toLowerCase().includes(category.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <div>
      {/* Navbar */}
      <Webnavbar />

      {/* Header Section */}
      <section className="py-4 bg-light">
  <Container className="text-center">
    <div className="d-flex justify-content-center">
      <input
        type="text"
        className="form-control w-50 me-2"
        placeholder="Search by product name..."
      />
      <Button
        variant="primary"
      >
        Search
      </Button>
    </div>
  </Container>
</section>

      {/* Tabs */}
      <section className="pt-4">
        <Container>
          <Nav
            variant="tabs"
            activeKey={activeTab}
            onSelect={handleTabSelect}
            className="mb-4 justify-content-center"
          >
            <Nav.Item>
              <Nav.Link eventKey="All">All</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="Smart TV">Smart TV</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="4K">4K</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="TB">TB</Nav.Link>
            </Nav.Item>
          </Nav>
        </Container>
      </section>

      {/* Product Grid */}
      <section className="pb-5">
        <Container>
          <div className="row row-cols-1 row-cols-md-3 g-4">
            {currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <div className="col" key={product._id}>
                  <Card className="h-100">
                    <Card.Img
                      variant="top"
                      src={`http://localhost:5000${product.image}`}
                      alt={product.product_name}
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
                <p>{error ? error : "No products available in this category."}</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="justify-content-center mt-4">
              {[...Array(totalPages).keys()].map((num) => (
                <Pagination.Item
                  key={num + 1}
                  active={num + 1 === currentPage}
                  onClick={() => setCurrentPage(num + 1)}
                >
                  {num + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          )}
        </Container>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AllProduct;
