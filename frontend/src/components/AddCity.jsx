import React, { useState, useEffect } from "react";
import axios from "axios";

const AddCity = () => {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [cityName, setCityName] = useState("");

  // ✅ Fetch all states on load
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/admin/getAllStates", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        console.log("States API Response:", res.data);
        setStates(Array.isArray(res.data) ? res.data : res.data.states || []);
      } catch (err) {
        console.error("Error fetching states:", err);
        setStates([]);
      }
    };
    fetchStates();
  }, []);

  // ✅ Fetch districts when state is selected
  const handleStateChange = async (e) => {
    const stateId = e.target.value;
    setSelectedState(stateId);
    setSelectedDistrict("");
    setDistricts([]);

    if (!stateId) return;

    try {
      const res = await axios.get(
        `http://localhost:3000/api/admin/states/${stateId}/districts`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      console.log("Districts API Response:", res.data);
      setDistricts(Array.isArray(res.data) ? res.data : res.data.districts || []);
    } catch (err) {
      console.error("Error fetching districts:", err);
      setDistricts([]);
    }
  };

  // ✅ Submit new city
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedState || !selectedDistrict || !cityName.trim()) {
      alert("Please fill all fields");
      return;
    }

    try {
      await axios.post(
        "http://localhost:3000/api/admin/city",
        {
          districtId: selectedDistrict, // backend expects this
          name: cityName,                // backend expects this
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      alert("City added successfully!");
      setCityName("");
      setSelectedDistrict("");
      setSelectedState("");
      setDistricts([]);
    } catch (err) {
      console.error("Error adding city:", err);
      alert(err.response?.data?.message || "Error adding city");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4">Add City</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* State Select */}
        <select
          value={selectedState}
          onChange={handleStateChange}
          className="p-3 border rounded-lg w-full"
        >
          <option value="">Select State</option>
          {states.map((s) => (
            <option key={s.id} value={s.id}>
              {s.stateName} {/* ✅ matches API field */}
            </option>
          ))}
        </select>

        {/* District Select */}
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          disabled={!selectedState}
          className="p-3 border rounded-lg w-full"
        >
          <option value="">Select District</option>
          {districts.length > 0 ? (
            districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} {/* ✅ matches API field */}
              </option>
            ))
          ) : (
            <option disabled>No districts available</option>
          )}
        </select>

        {/* City Input */}
        <input
          type="text"
          value={cityName}
          onChange={(e) => setCityName(e.target.value)}
          placeholder="Enter City Name"
          className="p-3 border rounded-lg w-full"
          disabled={!selectedDistrict}
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          disabled={!selectedDistrict || !cityName.trim()}
        >
          Add City
        </button>
      </form>
    </div>
  );
};

export default AddCity;
