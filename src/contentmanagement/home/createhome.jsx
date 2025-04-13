import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar";
import { useState } from "react";
import axios from "axios";

const Createhome = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const API_URL = "http://localhost:5000/api/homepage";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { title, description };
    console.log("Sending data to backend:", data); // Debug log
  
    try {
      const response = await axios.post(API_URL, data);
      console.log("Response from backend:", response.data); // Debug log
      setSuccess("Homepage content saved successfully!");
      setError(null);
      setTitle("");
      setDescription("");
      setTimeout(() => navigate(-1), 1000);
    } catch (error) {
      console.error("Error details:", error.response || error); // Detailed error log
      setError("Failed to save data. Please try again.");
      setSuccess(null);
    }
  };

  return (
    <>
      <div className="flex h-screen">
        <div className="flex-shrink-0">
          <Navbar />
        </div>
        <div className="content-container flex-1 bg-[#f5f6fa] p-6">
          <div className="fixed bg-white rounded-lg shadow">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-center text-gray-900">HOME</h3>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
                onClick={() => navigate(-1)}
              >
                BACK HOME
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
              <form className="space-y-8" onSubmit={handleSubmit}>
                {success && <div className="text-green-600 text-center">{success}</div>}
                {error && <div className="text-red-600 text-center">{error}</div>}
                <div>
                  <label htmlFor="name" className="block text-lg font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Title"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-lg font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    type="text"
                    id="description"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter Description"
                    required
                  />
                </div>
                <div className="mt-8">
                  <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-3 text-lg"
                  >
                    Submit Form
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Createhome;