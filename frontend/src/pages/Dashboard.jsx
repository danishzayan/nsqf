import React from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";

const Dashboard = ({ role }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("role"); // Clear saved role
    navigate("/"); // Go back to login
  };

  return (
    <div style={{ display: "flex" }}>
      dashboard
    </div>
  );
};

export default Dashboard;
