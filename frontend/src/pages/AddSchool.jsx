import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Trash2, Edit3 } from "lucide-react";
import SchoolForm from "../components/SchoolForm";

const AddSchool = () => {
  const [schools, setSchools] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Fetch all schools
  const fetchSchools = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/schools/getAllSchools");
      setSchools(res.data.data || []);
    } catch (err) {
      console.error("Error fetching schools:", err);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  // Delete school
  const deleteSchool = async (id) => {
    if (!window.confirm("Are you sure you want to delete this school?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/schools/deleteSchool/${id}`);
      setSchools(schools.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Error deleting school:", err);
    }
  };

  return (
    <div className="p-6  bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">School Manage</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center hover:cursor-pointer gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
        >
          <Plus className="w-5 h-5" />
          Add School
        </button>
      </div>

      {/* Add School Form */}
      {showForm && (
        <div className="absolute  inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <SchoolForm  onClose={() => setShowForm(false)} onSuccess={fetchSchools} />
       </div>
      )}

      {/* School List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">School Name</th>
              <th className="p-3 text-left">Address</th>
              <th className="p-3 text-left">City ID</th>
              <th className="p-3 text-left">Latitude</th>
              <th className="p-3 text-left">Longitude</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {schools.length > 0 ? (
              schools.map((school, idx) => (
                <tr key={school.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{idx + 1}</td>
                  <td className="p-3">{school.schoolName}</td>
                  <td className="p-3">{school.address}</td>
                  <td className="p-3">{school.cities_id}</td>
                  <td className="p-3">{school.latitude}</td>
                  <td className="p-3">{school.longitude}</td>
                  <td className="p-3 flex justify-center gap-3">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteSchool(school.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No schools found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddSchool;
