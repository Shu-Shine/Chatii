import React from "react";
import { BrowserRouter, Routes, Route} from "react-router-dom";

import  Register from "./pages/Register"
import Login from "./pages/Login"
import Chat from "./pages/Chat"
import Profile from "./pages/Profile";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/profile" element={<Profile/>} /> 
        <Route path="/" element={<Chat/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
