import "./dashboard.css";
import {Link} from 'react-router-dom';
import "bootstrap-icons/font/bootstrap-icons.css";
// import {Outlet} from "react-router-dom";
const Navbar = () =>{
    return(
        <div className="contain">
        <div className="nav-bar-right">
                <Link to="../dashboard" className="dashboard-title">
                    <h1>Dashboard</h1>
                </Link>
                <Link to="/contentmanagement/home">Home</Link>
                <Link to="/contentmanagement/aboutus">About Us</Link>
                <Link to="/contentmanagement/product">Product</Link>
                <Link to="/contentmanagement/userdetails">User Details</Link>
                <Link to="/contentmanagement/category">Category</Link>

        </div>
            <div className="user-icon-container">
                <i class="bi bi-person" ></i>
            </div>
            
        </div>
        
    );
}
export default Navbar;