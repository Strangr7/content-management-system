import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Category from './contentmanagement/category';
import Product from './contentmanagement/product';
import Home from './contentmanagement/home'; 
import About from './contentmanagement/aboutus';
import Userdetails from './contentmanagement/userdetails';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contentmanagement/home" element={<Home />} />
          <Route path="/contentmanagement/aboutus" element={<About />} />
          <Route path="/contentmanagement/product" element={<Product />} />
          <Route path="/contentmanagement/category" element={<Category />} /> 
          <Route path="/contentmanagement/userdetails" element={<Userdetails />} /> 
        </Routes>
      </BrowserRouter>
      

    </div>
  );
}

export default App;
