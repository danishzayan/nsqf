import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaSitemap,
  FaSchool,
  FaUserPlus,
  FaRegListAlt,
  FaSignOutAlt,
  FaChevronLeft,
} from "react-icons/fa";
import Schoollogo from "../assets/school.png"; // Adjust path if needed

const Sidebar = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("");

  const menus = {
    admin: [
      { name: "Dashboard", icon: <FaTachometerAlt />, path: "/dashboard" },
      { name: "Hierarchy", icon: <FaSitemap />, path: "/hierarchy" },
      { name: "Add School", icon: <FaSchool />, path: "/add-school" },
      { name: "School Assign", icon: <FaRegListAlt />, path: "/school-assign" },
      { name: "Registration", icon: <FaUserPlus />, path: "/registration" },
      { name: "Logout", icon: <FaSignOutAlt />, path: "/logout" },
    ],
    trainer: [
      { name: "My Students", icon: <FaRegListAlt />, path: "/students" },
      { name: "Schedule", icon: <FaSitemap />, path: "/schedule" },
      { name: "Performance", icon: <FaSchool />, path: "/performance" },
      { name: "Logout", icon: <FaSignOutAlt />, path: "/logout" },
    ],
    cordinator: [
      { name: "Trainer List", icon: <FaRegListAlt />, path: "/trainers" },
      { name: "Allocate Tasks", icon: <FaUserPlus />, path: "/allocate" },
      { name: "Track Progress", icon: <FaSitemap />, path: "/progress" },
      { name: "Logout", icon: <FaSignOutAlt />, path: "/logout" },
    ],
  };

  const handleNavigation = (menu) => {
    setActive(menu.name);
    if (menu.name === "Logout") {
      localStorage.removeItem("role");
      navigate("/");
    } else {
      navigate(menu.path);
    }
  };

  return (
    <div
      className={`h-screen  bg-blue-100 text-gray-800 flex flex-col shadow-lg border-r border-blue-200 transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      {!collapsed ? (
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center justify-center p-2 gap-2">
            <img
              src={Schoollogo}
              alt="Logo"
              className="w-7 h-7 object-contain"
            />
            <span className="text-lg font-bold text-center text-blue-500">NSQF</span>
          </div>
          <button
            onClick={() => setCollapsed(true)}
            className="text-blue-400 cursor-pointer hover:text-blue-600 transition-colors"
          >
            <FaChevronLeft />
          </button>
        </div>
      ) : (
        <div
          className="flex justify-center items-center h-16 cursor-pointer border-b border-gray-200"
          onClick={() => setCollapsed(false)}
        >
          <img
            src={Schoollogo}
            alt="Logo"
            className="w-10 h-10 object-contain hover:scale-110 transition-transform duration-200"
          />
        </div>
      )}

      {/* Menu */}
      <ul className="flex-1 p-3 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400/50">
        {menus[role]?.map((menu, index) => {
          const isActive = active
            ? active === menu.name
            : location.pathname === menu.path;
          return (
            <li
              key={index}
              onClick={() => handleNavigation(menu)}
              className={`flex items-center ${collapsed? " justify-center":""}  gap-8 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                isActive
                  ? "bg-blue-100 text-blue-600 shadow-sm"
                  : "hover:bg-blue-200 hover:shadow"
              }`}
            >
              <span className="text-lg ">{menu.icon}</span>
              {!collapsed && (
                <span className="text-sm font-medium">{menu.name}</span>
              )}
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 text-xs text-gray-500 border-t border-gray-200 text-center">
          © {new Date().getFullYear()} NSQF
        </div>
      )}
    </div>
  );
};

export default Sidebar;
