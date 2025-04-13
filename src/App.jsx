import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './webpages/index.jsx';
import Aboutus from './webpages/aboutus.jsx';
import ProductDetails from './webpages/Productdetails.jsx';
import Login from './webpages/login.jsx';
import Signup from './webpages/signup.jsx';
import Addtocart from './webpages/addtocart.jsx';
import AllProduct from './webpages/allproduct.jsx';
import Dashboard from './components/Dashboard';
import Category from './contentmanagement/category/category.jsx';
import Createcategory from './contentmanagement/category/createcategory.jsx';
import Updatecategory from './contentmanagement/category/updatecategory.jsx';
import Product from './contentmanagement/product/product.jsx';
import Createproduct from './contentmanagement/product/createproduct.jsx';
import Updateproduct from './contentmanagement/product/updateproduct.jsx';
import Home from './contentmanagement/home/home.jsx'; 
import Createhome from './contentmanagement/home/createhome.jsx';
import Updatehome from './contentmanagement/home/updatehome.jsx';
import About from './contentmanagement/aboutus/aboutus.jsx';
import Userdetails from './contentmanagement/user/userdetails.jsx';
import Createuser from './contentmanagement/user/createuser.jsx';
import Createabout from './contentmanagement/aboutus/createabout.jsx';
import Updateabout from './contentmanagement/aboutus/updateabout.jsx';
import Payment from './webpages/paymentmethod.jsx';



import "./App.css";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/webpages/aboutus" element={<Aboutus />} />
          <Route path="/webpages/productdetails/:id" element={<ProductDetails/>} />
          <Route path="/webpages/login" element={<Login/>} />
          <Route path="/webpages/signup" element={<Signup/>} />
          <Route path="/webpages/addtocart" element={<Addtocart/>} />
          <Route path="/webpages/paymentmethod" element={<Payment/>}/>
          <Route path="/webpages/allproduct" element={<AllProduct/>}/>

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contentmanagement/home/home" element={<Home />} />
            <Route path='/contentmanagement/home/createhome' element={<Createhome/>} />
            <Route path='/contentmanagement/home/updatehome' element={<Updatehome />} />
            <Route path="/contentmanagement/home/updatehome/:id" element={<Updatehome />} />
          <Route path="/contentmanagement/aboutus/aboutus" element={<About />} />
            <Route path="/contentmanagement/aboutus/createabout" element={<Createabout/>}/>       
            <Route path="/contentmanagement/aboutus/updateabout" element={<Updateabout/>}/>       
            <Route path="/contentmanagement/aboutus/updateabout/:id" element={<Updateabout/>}/>       
          <Route path="/contentmanagement/product/product" element={<Product />} />
            <Route path="/contentmanagement/product/createproduct" element={<Createproduct/>} />
            <Route path="/contentmanagement/product/updateproduct" element={<Updateproduct/>} />
            <Route path="/contentmanagement/product/updateproduct/:productId" element={<Updateproduct/>} />
          <Route path="/contentmanagement/category/category" element={<Category />} /> 
            <Route path="/contentmanagement/category/createcategory" element ={<Createcategory/>} />
            <Route path="/contentmanagement/category/updatecategory" element={<Updatecategory/>} />
            <Route path="/contentmanagement/category/updatecategory/:id" element={<Updatecategory/>} />
          <Route path="/contentmanagement/user/userdetails" element={<Userdetails />} /> 
            <Route path="/conentmanagement/user/createuser" element={<Createuser />} />
        </Routes>
      </BrowserRouter>
      

    </div>
  );
}

export default App;
