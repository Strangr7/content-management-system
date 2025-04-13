import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar";
import axios from "axios";

const Product = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/product/");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  const handleUpdate = (product) => {
    if (product && product._id) {
      navigate(`/contentmanagement/product/updateproduct/${product._id}`);
    } else {
      alert('Invalid product ID');
    }
  };
  const handleDelete = async (product) => {
    if (!product._id) {
      alert('Invalid product ID');
      return;
    }
  
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/product/${product._id}`);
        console.log('Product deleted successfully:', response.data);
  
        setProducts(prevProducts => prevProducts.filter(p => p._id !== product._id));
      } catch (error) {
        console.error('Failed to delete:', error);
        alert('Error deleting product');
      }
    }
  };
  
  if (loading) {
    return <div className="p-6">Loading products...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex h-screen">
      <div className="flex-shrink-0">
        <Navbar />
      </div>

      <div className="content-container flex-1 min-w-0 bg-[#f5f6fa] p-6">
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Products</h3>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
              onClick={() => navigate('/contentmanagement/product/createproduct')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New
            </button>
          </div>

          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products
                .sort((a, b) => a.product_id - b.product_id)
                .map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.product_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.product_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.category ? product.category.category_name : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-md"
                          onClick={() => handleUpdate(product)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md"
                          onClick={() => handleDelete(product)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Product;
