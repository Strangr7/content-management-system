import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/navbar";
import axios from "axios";

const UpdateCategory = () => {
  const navigate = useNavigate();

  // State hooks to hold form data

  return (
    <>
      <div className="flex h-screen">
        <div className="flex-shrink-0">
          <Navbar />
        </div>

        <div className="content-container flex-1 bg-[#f5f6fa] p-6">
          <div className="fixed bg-white rounded-lg shadow">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-center text-gray-900">Update Category</h3>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
                onClick={() => navigate(-1)}
              >
                BACK HOME
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
              <form className="space-y-8" >
                {/* Category ID Input (Read-only) */}
                <div>
                  <label htmlFor="category_id" className="block text-lg font-medium text-gray-700 mb-2">
                    Category ID
                  </label>
                  <input
                    type="number"
                    id="category_id"
                    name="category_id"
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Category ID"
                    disabled
                  />
                </div>

                {/* Category Name Input */}
                <div>
                  <label htmlFor="category_name" className="block text-lg font-medium text-gray-700 mb-2">
                    Category Name
                  </label>
                  <input
                    type="text"
                    id="category_name"
                    name="category_name"
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter Category Name"
                    required
                  />
                </div>


                {/* Submit Button */}
                <div className="mt-8">
                  <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-3 text-lg"
                  >
                    Update Category
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

export default UpdateCategory;
