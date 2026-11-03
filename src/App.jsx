// import React from 'react';
// import AdminDashboard from './components/AdminDashboard';


// function App() {
//   return (
//     <div>
// <AdminDashboard/>      
//     </div>
//   );
// }

// export default App;

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/HomePage";
import AdminLogin from "./components/AdminLogin";
import EmployeeLogin from "./components/EmployeeLogin";
import AdminDashboard from "./components/AdminDashboard";
import Complainform from "./components/Complainform";
import Conplain from "./components/Conplain";
import Complainstatus from "./components/Complainstatus";

function App() {
  return (
   
      <Routes>
        {/* Default Home Page */}
        <Route path="/" element={<Home />} />

        {/* Admin Panel */}
        <Route path="/admin" element={<AdminLogin />} />

        {/* Employee Panel */}
        <Route path="/employee" element={<EmployeeLogin />} />
        <Route path="/admindashboard" element={<AdminDashboard/>} />
       <Route path="/complainform" element={<Complainform/>} />
         <Route path="/complainstatus" element={<Complainstatus/>} />
        <Route path="/Conplain" element={<Conplain/>} />
        
      </Routes>
   
  );
}

export default App;