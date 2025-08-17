import React, { useState, useEffect } from "react";

const AddCity = () => {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [cityName, setCityName] = useState("");
  const [success, setSuccess] = useState(false);

  // Load states on mount
  useEffect(() => {
    const savedStates = JSON.parse(localStorage.getItem("statesDB")) || [];
    setStates(savedStates);
  }, []);

  // Load districts when state changes
  useEffect(() => {
    if (selectedState) {
      const savedDistricts = JSON.parse(localStorage.getItem("districtsDB")) || [];
      const filtered = savedDistricts.filter(
        (d) => d.stateId === selectedState
      );
      setDistricts(filtered);
    } else {
      setDistricts([]);
    }
    setSelectedDistrict("");
  }, [selectedState]);

  const handleAddCity = (e) => {
    e.preventDefault();

    if (!selectedState || !selectedDistrict || !cityName.trim()) {
      alert("Please select state, district and enter city name");
      return;
    }

    setTimeout(() => {
      const newCity = {
        id: Date.now(),
        name: cityName,
        stateId: selectedState,
        districtId: selectedDistrict,
      };

      const savedCities = JSON.parse(localStorage.getItem("citiesDB")) || [];
      const updated = [...savedCities, newCity];
      localStorage.setItem("citiesDB", JSON.stringify(updated));

      setSuccess(true);
      setCityName("");
    }, 500);
  };

  const closePopup = () => {
    setSuccess(false);
  };

  return (
    <div className="w-full flex items-center p-4">
      <div className="w-full max-w-xxl  bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
          Add New City
        </h2>

        <form onSubmit={handleAddCity} className=" sm:flex-row flex flex-col ggap-5">

          {/* State Dropdown */}
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>

          {/* District Dropdown */}
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            disabled={!selectedState}
            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
          >
            <option value="">Select District</option>
            {districts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>

          {/* City Input */}
          <input
            type="text"
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
            placeholder="Enter city name"
            disabled={!selectedDistrict}
            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!selectedDistrict || !cityName.trim()}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-1   rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            Add City
          </button>
        </form>

        {/* Success Popup */}
        {success && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center w-80">
              <h3 className="text-lg font-bold text-green-600">✅ Success!</h3>
              <p className="mt-2 text-gray-600">
                City has been added successfully.
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

export default AddCity;
