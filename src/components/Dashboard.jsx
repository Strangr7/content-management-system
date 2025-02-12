import "./dashboard.css";
import Navbar from "./navbar";

const Dashboard = () =>{
    return(
            <><Navbar />
           
           <div className="content-container">
            <div className="field-box">
                            <input type="text" placeholder="first name" /> <br /><br />
                            <input type="text" placeholder="last name" />
                            <button> Add</button>
                </div>
            </div>
                    
            
             </>
    );
}

export default Dashboard;