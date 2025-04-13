import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar";
import axios from "axios";

const Category = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);  // State to store categories
  const [error, setError] = useState(null);  // Error handling

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/category");
        setCategories(response.data);  // Store categories in state
      } catch (err) {
        setError("Failed to fetch categories");
      }
    };
    fetchCategories();
  }, []);

  const handleUpdate = (id) => {
    navigate(`/contentmanagement/category/updatecategory/${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      axios
        .delete(`http://localhost:5000/api/category/${id}`)
        .then(() => {
          // Update state after deletion
          setCategories(categories.filter((category) => category._id !== id));
        })
        .catch((err) => {
          console.error("Failed to delete:", err);
          alert("Error deleting the item.");
        });
    }
  };

  return (
    <>
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="flex-shrink-0">
          <Navbar />
        </div>

        {/* Content */}
        <div className="content-container flex-1 min-w-0 bg-[#f5f6fa] p-6">
          {/* Table Container */}
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            {/* Table Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Category</h3>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
                onClick={() => navigate('/contentmanagement/category/createcategory')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add New
              </button>
            </div>

            {/* Error Message */}
            {error && <div className="text-red-500 text-center py-2">{error}</div>}

            {/* Table Content */}
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Render categories dynamically */}
                {categories.map((category) => (
                  <tr key={category._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.category_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.category_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button 
                          className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-md" 
                          onClick={() => handleUpdate(category._id)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md"
                          onClick={() => handleDelete(category._id)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
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
    </>
  );
};

export default Category;
