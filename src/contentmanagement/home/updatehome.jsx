import React, { useState, useEffect } from 'react'; // Added useState and useEffect here
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from "../../components/navbar";// Import the Navbar component

const Updatehome = () => {
    const { id } = useParams(); // Get the 'id' from the URL
    const navigate = useNavigate();
  
    const [homeData, setHomeData] = useState({
      title: "",
      description: "",
    });
    const [message, setMessage] = useState(""); // To show success or error message
    const [isLoading, setIsLoading] = useState(false); // To manage loading state
  
    // Fetch home data on mount
    useEffect(() => {
      setIsLoading(true); // Start loading
      fetch(`http://localhost:5000/api/homepage/${id}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Home data not found');
          }
          return response.json();
        })
        .then((data) => {
          setHomeData({
            title: data.title,
            description: data.description,
          });
          setIsLoading(false); // Stop loading
        })
        .catch((error) => {
          console.error("Error fetching home data:", error);
          setIsLoading(false); // Stop loading
          setMessage("Error fetching home data. Please try again.");
        });
    }, [id]);
  
    // Reset the message after 3 seconds (optional cleanup)
    useEffect(() => {
      if (message) {
        const timer = setTimeout(() => {
          setMessage("");
        }, 3000);
        return () => clearTimeout(timer); // Clean up the timeout on unmount
      }
    }, [message]);
  
    const handleChange = (e) => {
      setHomeData({
        ...homeData,
        [e.target.name]: e.target.value,
      });
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      setIsLoading(true); // Start loading
      // Send the updated data to the backend (adjust API URL accordingly)
      fetch(`http://localhost:5000/api/homepage/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(homeData),
      })
        .then((response) => response.json())
        .then(() => {
          setIsLoading(false); // Stop loading
          setMessage("Home data updated successfully.");
          setTimeout(() => navigate(-1), 1000); // Redirect after 2 seconds
        })
        .catch((error) => {
          console.error("Error updating home data:", error);
          setIsLoading(false); // Stop loading
          setMessage("Error updating home data. Please try again.");
        });
    };
  
    return (
      <div className="flex h-screen">
        <div className="flex-shrink-0">
          <Navbar /> {/* Navbar component */}
        </div>

        <div className="content-container flex-1 bg-[#f5f6fa] p-6">
          <div className="fixed bg-white rounded-lg shadow">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-center text-gray-900">Update Home</h3>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2" onClick={() => navigate(-1)}>
                BACK TO HOME
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
              <form className="space-y-8" onSubmit={handleSubmit}>
                {/* Title Input */}
                <div>
                  <label htmlFor="title" className="block text-lg font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={homeData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter title"
                    required
                  />
                </div>

                {/* Description Input */}
                <div>
                  <label htmlFor="description" className="block text-lg font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={homeData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter description"
                    rows="4"
                    required
                  />
                </div>

                {/* Message (Success/Failure) */}
                {message && (
                  <div className={`mt-4 text-center ${message.includes("Error") ? 'text-red-600' : 'text-green-600'}`}>
                    {message}
                  </div>
                )}

                {/* Submit Button */}
                <div className="mt-8">
                  <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-3 text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span>Loading...</span>
                    ) : (
                      "Submit Updates"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
};

export default Updatehome;
