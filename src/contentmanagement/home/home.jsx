import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate,} from 'react-router-dom';
import Navbar from "../../components/navbar"; // Assuming the Navbar is imported correctly

const Home = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]); // To store fetched data
  const [loading, setLoading] = useState(true); // To handle loading state
  const [error, setError] = useState(null); // To handle errors

  // Fetch data from the API
  useEffect(() => {
    axios.get('http://localhost:5000/api/homepage')
      .then(response => {
        const sortedData = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setData(sortedData); // Update state with the fetched data
        setLoading(false); // Set loading to false once data is fetched
      })
      .catch(err => {
        setError(err.message); // Set error if there is an issue with fetching data
        setLoading(false);
      });
  }, []);

  // Handle Delete Action
  const handleDelete = (id) => {
    if(window.confirm("Are you sure you want to delete this item")) {
    axios
    .delete(`http://localhost:5000/api/homepage/${id}`)
      .then(response => {
        // Remove deleted item from state
        setData(prevData => prevData.filter(item => item._id !== id));
      })
      .catch(err => {
        console.error('Delete error:', err);
      });
  };
  }
  // Handle Update Action
  const handleUpdate = (id) => {
    navigate(`/contentmanagement/home/updatehome/${id}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="flex-shrink-0">
          <Navbar />
        </div>

        {/* Content */}
        <div className="content-container flex-1 min-w-0 bg-[#f5f6fa] p-6">
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            {/* Table Header with Add Button */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">HOME</h3>
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2" 
                onClick={() => navigate('/contentmanagement/home/createhome')}
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

            {/* Table Content */}
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Render data rows */}
                {data.length > 0 ? (
                  data.map((item) => (
                    <tr key={item._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          {/* Update Button */}
                          <button 
                            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-md" 
                            onClick={() => handleUpdate(item._id)}
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

                          {/* Delete Button */}
                          <button 
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md" 
                            onClick={() => handleDelete(item._id)}
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
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-4">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
