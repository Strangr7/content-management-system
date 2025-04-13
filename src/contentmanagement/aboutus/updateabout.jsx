import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar";
import axios from "axios";

const UpdateAbout = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/aboutpage/${id}`);
        setTitle(response.data.title);
        setDescription(response.data.description);
        setPreviewImage(response.data.image); // Assuming image is a filename or URL path
      } catch (err) {
        setError("Failed to fetch about data");
      }
    };

    fetchAboutData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (image) formData.append("image", image);

    try {
      await axios.put(`http://localhost:5000/api/aboutpage/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccess("About page updated successfully!");
      setError(null);
      setTimeout(() => navigate(-1), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      setSuccess(null);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex-shrink-0">
        <Navbar />
      </div>

      <div className="content-container flex-1 bg-[#f5f6fa] p-6">
        <div className="fixed bg-white rounded-lg shadow">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Update About Us</h3>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              onClick={() => navigate(-1)}
            >
              BACK
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Title */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Title</label>
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
                <label className="block text-lg font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg"
                  placeholder="Enter description"
                  required
                />
              </div>

              {/* Existing Image Preview */}
              {previewImage && (
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">Current Image</label>
                  <img
                    src={`http://localhost:5000/uploads/${previewImage}`}
                    alt="Preview"
                    className="w-40 h-auto rounded-md shadow-md mb-4"
                  />
                </div>
              )}

              {/* Upload New Image */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Upload New Image</label>
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
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateAbout;
