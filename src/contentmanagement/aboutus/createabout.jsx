import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar";
import { useState } from "react";
import axios from "axios";

const Createabout = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (image) formData.append("image", image);

    try {
      const response = await axios.post("http://localhost:5000/api/aboutpage", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccess("About page created successfully!");
      setError(null);
      navigate(-1); // Go back after success
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
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
              <h3 className="text-lg font-semibold text-gray-900">About Us</h3>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                onClick={() => navigate(-1)}
              >
                ABOUT HOME
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Title */}
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg"
                    placeholder="Enter title"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg"
                    placeholder="Enter description"
                    required
                  />
                </div>

                {/* Image */}
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Upload Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                    className="w-full text-lg"
                  />
                </div>

                {/* Feedback */}
                {error && <div className="text-red-500">{error}</div>}
                {success && <div className="text-green-500">{success}</div>}

                {/* Submit */}
                <div className="mt-4">
                  <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg text-lg"
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

export default Createabout;
