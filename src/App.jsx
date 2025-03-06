import {BrowserRouter, Routes, Route} from "react-router-dom"
import React from "react"
import Login from "./Components/Login"
import SignUp from "./Components/SignUp";


function App() {

  return (
    <>
      {/* <Login/> */}
      <BrowserRouter>
        <Routes>
        <Route path="/login" element={<Login/>}/>
        <Route path="/signup" element={<SignUp/>}/>
        </Routes>
      </BrowserRouter>
        
    </>
  )
}

export default App
