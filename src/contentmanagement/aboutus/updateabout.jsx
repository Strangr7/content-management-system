
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar";
// import axios from "axios";

const UpdateAbout = () => {
  const navigate = useNavigate();

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
            <form className="space-y-6" >
              {/* Title */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value=""
                  className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg"
                  placeholder="Enter title"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value=""
                  className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg"
                  placeholder="Enter description"
                  required
                />
              </div>

              {/* Existing Image Preview */}
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">Current Image</label>
                  <img
                    src=""
                    alt="Preview"
                    className="w-40 h-auto rounded-md shadow-md mb-4"
                  />
                </div>

              {/* Upload New Image */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Upload New Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-lg"
                />
              </div>

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
