import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar";

const Createuser= () => {
    const navigate  = useNavigate();
    return (
        <>
        <div className="flex h-screen">
  {/* Sidebar - add fixed width and prevent shrinking */}
  <div className="flex-shrink-0">
    <Navbar />
  </div>
        
  {/* Content container - takes remaining space */}
  <div className="content-container flex-1 bg-[#f5f6fa] p-6">
  {/* Table Container */}
  
  <div className="fixed bg-white rounded-lg shadow">
  
    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
    <h3 className="text-lg font-semibold  text-center text-gray-900">User Details</h3>
      <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2" onClick={() => navigate(-1)}>
        User CREATE
      </button>
    </div>

    <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
        <form className="space-y-8">
            {/* Name Input */}
            <div>
            <label 
                htmlFor="name" 
                className="block text-lg font-medium text-gray-700 mb-2"
            >
                Name
            </label>
            <input
                type="text"
                id="name"
                name="name"
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Enter name"
                required
            />
            </div>

            {/* Email Input */}
            <div>
            <label 
                htmlFor="email" 
                className="block text-lg font-medium text-gray-700 mb-2"
            >
                Email
            </label>
            <input
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Enter email"
                required
            />
            </div>

            {/* Submit Button */}
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
}

export default Createuser;