import React, { useState } from "react";
import axios from "axios";
import { School, Home, Search, MapPin, Navigation, Globe, CheckCircle } from "lucide-react";

const AddSchool = () => {
  const [formData, setFormData] = useState({
    schoolName: "",
    address: "",
    cities_id: "",
    latitude: "",
    longitude: "",
  });

  const [cityOptions, setCityOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Search cities when typing
  const searchCities = async (name) => {
    if (!name) {
      setCityOptions([]);
      return;
    }
    try {
      const res = await axios.get(
        `http://localhost:3000/api/admin/searchCities?name=${name}`
      );
      console.log("Cities fetched:", res.data);
      setCityOptions(res.data.data || []);
    } catch (err) {
      console.error("Error fetching cities", err);
    }
  };

  // Submit school
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    try {
      const res = await axios.post(
        "http://localhost:3000/api/schools/createSchool",
        formData
      );
      if (res.data.success) {
        setSuccessMsg("✅ School created successfully!");
        setFormData({
          schoolName: "",
          address: "",
          cities_id: "",
          latitude: "",
          longitude: "",
        });
      }
    } catch (err) {
      console.error("Error creating school", err);
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center text-indigo-600 mb-6 flex items-center justify-center gap-2">
          <School className="w-6 h-6" /> 🏫 Add New School
        </h1>

        {successMsg && (
          <p className="text-green-600 text-center mb-4 flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" /> {successMsg}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* School Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              School Name
            </label>
            <div className="relative">
              <School className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                placeholder="Enter school name"
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Address
            </label>
            <div className="relative">
              <Home className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
                rows={2}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* City Search */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">City</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search city..."
                onChange={(e) => searchCities(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              />
            </div>
            {cityOptions.length > 0 && (
              <ul className="border rounded-lg mt-2 max-h-40 overflow-y-auto shadow-md bg-white">
                {cityOptions.map((city) => (
                  <li
                    key={city.id}
                    onClick={() =>
                      setFormData({ ...formData, cities_id: city.id })
                    }
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-indigo-100 transition ${
                      formData.cities_id === city.id
                        ? "bg-indigo-200 font-semibold"
                        : ""
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    {city.name}
                  </li>
                ))}
              </ul>
            )}
            {formData.cities_id && (
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-green-600" />
                Selected City ID: {formData.cities_id}
              </p>
            )}
          </div>

          {/* Latitude */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Latitude
            </label>
            <div className="relative">
              <Navigation className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="Enter latitude"
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Longitude */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Longitude
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="number"
                step="any"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="Enter longitude"
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Submitting..." : "Create School"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddSchool;
