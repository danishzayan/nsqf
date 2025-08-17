import React from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const MainLayout = ({ role }) => {
  return (
    <div className="flex h-screen">
      <Sidebar role={role} />
      <div className="flex-1 bg-white overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
