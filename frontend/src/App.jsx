import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Hierarchy from "./pages/Hierarchy";
import AddSchool from "./pages/AddSchool";
import SchoolAssign from "./pages/SchoolAssign";
import Registration from "./pages/Registration";
import ProtectedRoute from "./pages/ProtectedRoute";
import MainLayout from "./pages/MainLayout";

function App() {
  const [role, setRole] = useState(localStorage.getItem("role") || "");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setRole={setRole} />} />

        <Route
          element={
            <ProtectedRoute>
              <MainLayout role={role} />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/hierarchy" element={<Hierarchy />} />
          <Route path="/add-school" element={<AddSchool />} />
          <Route path="/school-assign" element={<SchoolAssign />} />
          <Route path="/registration" element={<Registration />} />
          {/* Add other routes here */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
