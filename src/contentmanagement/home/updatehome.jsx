import React, { useState, useEffect } from 'react'; // Added useState and useEffect here
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from "../../components/navbar";// Import the Navbar component

const Updatehome = () => {
    const navigate = useNavigate();
  
  
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
              <form className="space-y-8" >
                {/* Title Input */}
                <div>
                  <label htmlFor="title" className="block text-lg font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
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
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter description"
                    rows="4"
                    required
                  />
                </div>

                {/* Message (Success/Failure) */}
                  {/* <div className={`mt-4 text-center ${message.includes("Error") ? 'text-red-600' : 'text-green-600'}`}>
                    {message}
                  </div> */}

                {/* Submit Button */}
                <div className="mt-8">
                  <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-3 text-lg"
                  >
                    
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
