import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar";

const Aboutus = () => {
  const navigate = useNavigate();


  // Fetch About Us data on mount
  return (
    <>
      <div className="flex h-screen">
        <div className="flex-shrink-0">
          <Navbar />
        </div>

        <div className="content-container flex-1 min-w-0 bg-[#f5f6fa] p-6">
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">About US</h3>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
                onClick={() => navigate("/contentmanagement/aboutus/createabout")}
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

            {/* Table */}
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">data 1</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">data 2</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <img src="/" alt="about" className="h-12 w-12 rounded-md" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                         {/* Update Button */}
                         <button 
                            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-md" 
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
                    </td>
                  </tr>
             
              </tbody>
            </table>

          </div>
        </div>
      </div>
    </>
  );
};

export default Aboutus;
