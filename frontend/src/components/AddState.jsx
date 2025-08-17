import React, { useState } from "react";
import axios from "axios";

const AddState = () => {
  const [stateName, setStateName] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddState = async (e) => {
    e.preventDefault();

    if (!stateName.trim()) {
      alert("Please enter a state name");
      return;
    }

    try {
      setLoading(true);

      // ✅ Get token from localStorage
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:3000/api/admin/state",
        { stateName },
        {
          headers: {
            Authorization: `Bearer ${token}`, // send token
          },
        }
      );

      console.log("Response:", response);
      console.log("statename:", stateName);

      if (response.status === 201 || response.status === 200) {
        setSuccess(true);
        setStateName(""); // clear input
      } else {
        alert("Something went wrong while adding the state");
      }
    } catch (error) {
      console.error("Error adding state:", error);
      alert(error.response?.data?.message || "Failed to add state");
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => {
    setSuccess(false);
  };

  return (
    <div className="w-full flex items-center p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
          Add New State
        </h2>

        <form
          onSubmit={handleAddState}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            value={stateName}
            onChange={(e) => setStateName(e.target.value)}
            placeholder="Enter state name"
            className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className={`${
              loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
            } text-white px-5 py-3 rounded-xl shadow-md transition-all`}
          >
            {loading ? "Adding..." : "Add State"}
          </button>
        </form>

        {/* Success Popup */}
        {success && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center w-80">
              <h3 className="text-lg font-bold text-green-600">✅ Success!</h3>
              <p className="mt-2 text-gray-600">
                State has been added successfully.
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

export default AddState;
