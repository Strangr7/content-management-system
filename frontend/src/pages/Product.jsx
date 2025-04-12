import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProductById } from '../services/products';
import { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';

export default function Product() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await fetchProductById(id);
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  if (loading) return <div className="text-center my-5">Loading product...</div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-6">
          <img 
            src={product.image} 
            alt={product.name} 
            className="img-fluid rounded"
          />
        </div>
        <div className="col-md-6">
          <h2>{product.name}</h2>
          <p className="text-muted">SKU: {product._id}</p>
          <h3 className="my-3">${product.price.toFixed(2)}</h3>
          <p>{product.description}</p>
          <button 
            className="btn btn-primary btn-lg"
            onClick={() => addToCart(product._id)}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}