import React, { useState, useEffect } from "react";

const AddDistrict = () => {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [districts, setDistricts] = useState([]); // dummy DB
  const [success, setSuccess] = useState(false);

useEffect(() => {
  const savedStates = JSON.parse(localStorage.getItem("statesDB")) || [];
  setStates(savedStates);
}, []);


  const handleAddDistrict = (e) => {
    e.preventDefault();

    if (!selectedState) {
      alert("Please select a state");
      return;
    }
    if (!districtName.trim()) {
      alert("Please enter a district name");
      return;
    }

    setTimeout(() => {
      setDistricts((prev) => [
        ...prev,
        { id: Date.now(), state: selectedState, name: districtName },
      ]);
      setSuccess(true);
      setDistrictName("");
    }, 500);
  };

  const closePopup = () => {
    setSuccess(false);
  };

  return (
    <div className="w-full flex items-center  p-4">
      <div className="w-full max-w-xl bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
          Add New District
        </h2>

        <form onSubmit={handleAddDistrict} className="sm:flex-row flex flex-col w-full gap-4">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="p-3 border px-5  border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-sm"
          >
            <option value="">Select a State</option>
            {states.map((state) => (
              <option key={state.id} value={state.name}>
                {state.name}
              </option>
          
            ))}
       
          </select>

          <input
            type="text"
            value={districtName}
            onChange={(e) => setDistrictName(e.target.value)}
            placeholder="Enter district name"
            disabled={!selectedState}
            className={`p-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${
              !selectedState ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          />

          <button
            type="submit"
            disabled={!selectedState}
            className={`px-5 py-3 rounded-xl shadow-md transition-all ${
              selectedState
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Add District
          </button>
        </form>

        {success && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center w-80">
              <h3 className="text-lg font-bold text-green-600">✅ Success!</h3>
              <p className="mt-2 text-gray-600">
                District has been added successfully.
              </p>
              <button
                onClick={closePopup}
                className="mt-4 px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddDistrict;
