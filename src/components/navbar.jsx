import { useNavigate,Link } from "react-router-dom";
// import "bootstrap-icons/font/bootstrap-icons.css";

const Navbar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logging out...");
    navigate('/');

  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="h-screen w-64 bg-blue-400 text-white flex flex-col items-center py-6 shadow-lg">
        {/* Dashboard Title */}
        <Link to="../dashboard" className="text-2xl !text-white font-bold mb-6 hover:text-white">
          Dashboard
        </Link>

        {/* Navigation Links */}
        <nav className="flex flex-col space-y-4 w-full text-center">
          <Link
            to="/contentmanagement/home/home"
            className="px-4 py-2 !text-white rounded-md hover:bg-green-400 hover:text-white transition"
          >
            Home
          </Link>
          <Link
            to="/contentmanagement/aboutus/aboutus"
            className="px-4 py-2 !text-white rounded-md hover:bg-green-400 hover:text-white transition"
          >
            About Us
          </Link>
          <Link
            to="/contentmanagement/product/product"
            className="px-4 py-2 !text-white rounded-md hover:bg-green-400 hover:text-white transition"
          >
            Product
          </Link>
          <Link
            to="/contentmanagement/user/userdetails"
            className="px-4 py-2 !text-white rounded-md hover:bg-green-400 hover:text-white transition"
          >
            User Details
          </Link>
          <Link to="/contentmanagement/category/category" className="px-4 py-2 !text-white rounded-md hover:bg-green-400 hover:text-white transition" >
            Category
          </Link>
        </nav>

        {/* User Icon */}
        {/* User Icon with Tailwind */}
      <div className="mt-auto pb-6 cursor-pointer text-white hover:text-gray-200 transition-colors duration-200"
        onClick={handleLogout}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-8 w-8" 
          viewBox="0 0 24 24" 
          fill="currentColor"
          aria-hidden="true"
        >
          <path 
            fillRule="evenodd" 
            d="M12 2.25a4.5 4.5 0 100 9 4.5 4.5 0 000-9zM6 6.75a6 6 0 1110.816 3.551 15.088 15.088 0 00-3.103 3.098A6 6 0 016 6.75zm12.774 13.098a9 9 0 00-13.548 0 11.96 11.96 0 0113.548 0z" 
            clipRule="evenodd" 
          />
        </svg>
      </div>
      </div>
    </div>
  );
};

export default Navbar;