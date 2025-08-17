import React, { useState } from "react";
import AddState from "../components/AddState";
import AddDistrict from "../components/AddDistrict";
import AddCity from "../components/AddCity";

const Hierarchy = () => {
  const [activeTab, setActiveTab] = useState("state");

  const tabs = [
    { id: "state", label: "Add State" },
    { id: "district", label: "Add District" },
    { id: "city", label: "Add City" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center px-4 py-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
        Location Hierarchy Manager
      </h1>

      {/* Tabs Navigation */}
      <div className="flex w-full max-w-2xl bg-white shadow-md rounded-2xl overflow-hidden mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 cursor-pointer text-sm sm:text-base font-medium transition-all ${
              activeTab === tab.id
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-blue-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="w-full max-w-2xl">
        {activeTab === "state" && (
          <div className="bg-white shadow-lg rounded-2xl p-4 sm:p-6 transition-all">
            <AddState />
          </div>
        )}
        {activeTab === "district" && (
          <div className="bg-white shadow-lg rounded-2xl p-4 sm:p-6 transition-all">
            <AddDistrict />
          </div>
        )}
        {activeTab === "city" && (
          <div className="bg-white shadow-lg rounded-2xl p-4 sm:p-6 transition-all">
            <AddCity />
          </div>
        )}
      </div>
    </div>
  );
};

export default Hierarchy;
