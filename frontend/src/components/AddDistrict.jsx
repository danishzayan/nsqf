import React, { useEffect, useState } from "react";
import axios from "axios";

const AddDistrict = () => {
  const [states, setStates] = useState([]);
  const [districtName, setDistrictName] = useState("");
  const [pincode, setPincode] = useState(""); // ✅ new state for pincode
  const [selectedState, setSelectedState] = useState("");

  // Fetch all states
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/admin/getAllStates",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, // send token
            },
          }
        );
        console.log("States response:", response.data);
        setStates(response.data); // assuming API returns an array
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };

    fetchStates();
  }, []);

  const handleAddDistrict = async (e) => {
    e.preventDefault();

    if (!districtName.trim() || !pincode.trim() || !selectedState) {
      alert("Please enter district name, pincode and select a state");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/admin/district", {
        name: districtName,   // ✅ backend expects "name"
        pincode: pincode,     // ✅ add pincode
        stateId: selectedState
      },{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // send token
        },
      });

      if (response.status === 201 || response.status === 200) {
        alert("District added successfully!");
        setDistrictName("");
        setPincode(""); // reset pincode
        setSelectedState("");
      }
    } catch (error) {
      console.error("Error adding district:", error);
      alert("Failed to add district");
    }
  };

  return (
    <div className="w-full flex items-center p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
          Add New District
        </h2>

        <form onSubmit={handleAddDistrict} className="flex flex-col gap-3">
          {/* Dropdown for state */}
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="p-3 border border-gray-200 rounded-xl"
          >
            <option value="">-- Select State --</option>
            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.stateName}
              </option>
            ))}
          </select>

          {/* District input */}
          <input
            type="text"
            value={districtName}
            onChange={(e) => setDistrictName(e.target.value)}
            placeholder="Enter district name"
            className="p-3 border border-gray-200 rounded-xl"
          />

          {/* Pincode input */}
          <input
            type="text"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            placeholder="Enter district pincode"
            className="p-3 border border-gray-200 rounded-xl"
          />

          {/* Button */}
          <button
            type="submit"
            className="bg-blue-500 text-white px-5 py-3 rounded-xl hover:bg-blue-600 transition-all"
          >
            Add District
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDistrict;
