import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/navbar";

const UpdateProduct = () => {
  const navigate = useNavigate();
  const { productId } = useParams();  // Get the product ID from the URL parameters

  const [formData, setFormData] = useState({
    product_id: "",
    product_name: "",
    screen_size: "",
    resolution: "",
    display_type: "",
    category_name: "",
    price: "",
    stock: "",
    smart_tv: "false", // dropdown value as string
    image: null,
  });

  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/category"); // adjust if your endpoint differs
        const data = await res.json();
        setCategories(data); // expects array of { category_name: string }
      } catch (err) {
        console.error("Error loading categories:", err);
        setError("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  // Fetch product details to populate form
  useEffect(() => {
    if (!productId) {
      setError("Product ID is missing");
      return;
    }
  
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/product/${productId}`);
        const data = await res.json();
        
        if (res.ok) {
          setFormData({
            product_id: data.product_id,
            product_name: data.product_name,
            screen_size: data.screen_size,
            resolution: data.resolution,
            display_type: data.display_type,
            category_name: data.category_name,
            price: data.price,
            stock: data.stock,
            smart_tv: data.smart_tv.toString(),
            image: null,
          });
        } else {
          setError("Failed to load product data");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product");
      }
    };
  
    fetchProduct();
  }, [productId]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    try {
      const res = await fetch(`http://localhost:5000/api/product/${productId}`, {
        method: "PUT", // Use PUT for updating
        body: data,
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.message || "Something went wrong");
      } else {
        setMessage("Product updated successfully!");
        navigate(-1);
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError("Network or server error");
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex-shrink-0">
        <Navbar />
      </div>

      <div className="content-container flex-1 bg-[#f5f6fa] p-6 overflow-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Update Product</h3>
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Back
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
            <div>
              <label htmlFor="product_id" className="block font-medium mb-1">Product ID</label>
              <input
                type="text"
                id="product_id"
                name="product_id"
                value={formData.product_id}
                onChange={handleChange}
                disabled
                className="w-full border px-4 py-2 rounded"
              />
            </div>

            <div>
              <label htmlFor="product_name" className="block font-medium mb-1">Product Name</label>
              <input
                type="text"
                id="product_name"
                name="product_name"
                value={formData.product_name}
                onChange={handleChange}
                required
                className="w-full border px-4 py-2 rounded"
              />
            </div>

            <div>
              <label htmlFor="screen_size" className="block font-medium mb-1">Screen Size</label>
              <input
                type="text"
                id="screen_size"
                name="screen_size"
                value={formData.screen_size}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded"
              />
            </div>

            <div>
              <label htmlFor="resolution" className="block font-medium mb-1">Resolution</label>
              <input
                type="text"
                id="resolution"
                name="resolution"
                value={formData.resolution}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded"
              />
            </div>

            <div>
              <label htmlFor="display_type" className="block font-medium mb-1">Display Type</label>
              <input
                type="text"
                id="display_type"
                name="display_type"
                value={formData.display_type}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded"
              />
            </div>

            <div>
              <label htmlFor="category_name" className="block font-medium mb-1">Category</label>
              <select
                id="category_name"
                name="category_name"
                value={formData.category_name}
                onChange={handleChange}
                required
                className="w-full border px-4 py-2 rounded"
              >
                <option value="">Select Category</option>
                {categories.map((cat, index) => (
                  <option key={index} value={cat.category_name}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="price" className="block font-medium mb-1">Price</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full border px-4 py-2 rounded"
              />
            </div>

            <div>
              <label htmlFor="stock" className="block font-medium mb-1">Stock</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                className="w-full border px-4 py-2 rounded"
              />
            </div>

            {/* Smart TV Dropdown */}
            <div>
              <label htmlFor="smart_tv" className="block font-medium mb-1">Smart TV</label>
              <select
                id="smart_tv"
                name="smart_tv"
                value={formData.smart_tv}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded"
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>

            <div>
              <label htmlFor="image" className="block font-medium mb-1">Product Image</label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded"
            >
              Update Product
            </button>

            {message && <p className="text-green-600 font-medium">{message}</p>}
            {error && <p className="text-red-600 font-medium">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProduct;
