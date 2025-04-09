import { NavLink } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

const Navbar = () => {
  const handleLogout = () => {
    console.log("Logging out...");
    // Add your logout logic here
  };

  return (
    <div className="d-flex">
      <div 
        className="vh-100 w-25 bg-primary text-white d-flex flex-column align-items-center py-4 shadow"
        style={{ minWidth: '250px' }}
      >
        <NavLink 
          to="/dashboard" 
          className="fs-3 text-white fw-bold mb-5 text-decoration-none"
          activeClassName="active"
        >
          Dashboard
        </NavLink>

        <nav className="d-flex flex-column w-100 text-center gap-3">
          <NavLink
            to="/contentmanagement/home"
            className="px-4 py-2 text-white text-decoration-none rounded hover-bg-success"
            activeClassName="active"
          >
            Home
          </NavLink>
          <NavLink
            to="/contentmanagement/aboutus"
            className="px-4 py-2 text-white text-decoration-none rounded hover-bg-success"
            activeClassName="active"
          >
            About Us
          </NavLink>
          <NavLink
            to="/contentmanagement/product"
            className="px-4 py-2 text-white text-decoration-none rounded hover-bg-success"
            activeClassName="active"
          >
            Product
          </NavLink>
          <NavLink
            to="/contentmanagement/userdetails"
            className="px-4 py-2 text-white text-decoration-none rounded hover-bg-success"
            activeClassName="active"
          >
            User Details
          </NavLink>
          <NavLink 
            to="/contentmanagement/category" 
            className="px-4 py-2 text-white text-decoration-none rounded hover-bg-success"
            activeClassName="active"
          >
            Category
          </NavLink>
        </nav>

        <div 
          className="mt-auto pb-4 cursor-pointer text-white"
          onClick={handleLogout}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="currentColor"
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