import React, { useState } from "react";
import axios from "axios";
import { CheckCircle, AlertCircle, X, Search, Users, School } from "lucide-react";

const SchoolAssign = () => {
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [schoolSearch, setSchoolSearch] = useState("");
  const [schoolResults, setSchoolResults] = useState([]);

  const [trainerSearch, setTrainerSearch] = useState("");
  const [trainerResults, setTrainerResults] = useState([]);
  const [selectedTrainers, setSelectedTrainers] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignmentResults, setAssignmentResults] = useState(null);

  // 🔹 Search Schools API
  const handleSchoolSearch = async (e) => {
    const query = e.target.value;
    setSchoolSearch(query);

    if (query.length > 1) {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/schools/searchSchool?name=${query}`
        );
        setSchoolResults(res.data || []);
      } catch (err) {
        console.error("Error fetching schools", err);
        setSchoolResults([]);
      }
    } else {
      setSchoolResults([]);
    }
  };

  const handleSelectSchool = (school) => {
    setSelectedSchool(school);
    setSchoolResults([]);
    setSchoolSearch(school.schoolName);
    setAssignmentResults(null); // Clear previous results
  };

  // 🔹 Search Trainers API
  const handleTrainerSearch = async (e) => {
    const query = e.target.value;
    setTrainerSearch(query);

    if (query.length > 1) {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/v1/searchTrainer?name=${query}`
        );
        setTrainerResults(res.data?.data || []);
      } catch (err) {
        console.error("Error fetching trainers", err);
        setTrainerResults([]);
      }
    } else {
      setTrainerResults([]);
    }
  };

  const handleAddTrainer = (trainer) => {
    if (!selectedTrainers.some((t) => t.id === trainer.id)) {
      setSelectedTrainers([...selectedTrainers, trainer]);
    }
    setTrainerResults([]);
    setTrainerSearch("");
  };

  const handleRemoveTrainer = (id) => {
    setSelectedTrainers(selectedTrainers.filter((t) => t.id !== id));
  };

  // 🔹 Assign Trainers API
  const handleAssign = async () => {
  if (!selectedSchool || selectedTrainers.length === 0) {
    alert("Please select school and trainers");
    return;
  }

  setIsSubmitting(true);
  setAssignmentResults(null);

  try {
    // Extract trainer IDs into array
    const trainerIds = selectedTrainers.map((trainer) => trainer.id);

    // Call API once with userIds array
    const res = await axios.post("http://localhost:3000/api/trainer/create", {
      userIds: trainerIds,          // array of trainer ids
      schoolId: selectedSchool.id,  // single school id
    });

    // ✅ Instead of alert, store results for UI
    setAssignmentResults(res.data);

    // Reset selections
    setSelectedTrainers([]);
    setSelectedSchool(null);
    setSchoolSearch("");
    setTrainerSearch("");
  } catch (err) {
    console.error(err);

    // ✅ Show error in assignment results screen
    setAssignmentResults({
      error: true,
      message: "Error assigning trainers",
    });
  } finally {
    setIsSubmitting(false);
  }
};



  const handleStartOver = () => {
    setSelectedTrainers([]);
    setSelectedSchool(null);
    setSchoolSearch("");
    setAssignmentResults(null);
  };

  const successCount = assignmentResults?.results?.filter((r) => r.status === "success").length || 0;
  const skippedCount = assignmentResults?.results?.filter((r) => r.status === "skipped").length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 flex items-center justify-center ">
      <div className="w-[40vw] mx-auto">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            <h2 className="text-2xl font-bold text-white text-center flex items-center justify-center gap-3">
              <Users className="w-8 h-8" />
              Assign Trainers to School
            </h2>
          </div>

          <div className="p-8">
            {!assignmentResults ? (
              <>
                {/* 🔹 School Search */}
                <div className="mb-8 relative">
                  <label className="block mb-3 font-semibold text-gray-700 flex items-center gap-2">
                    <School className="w-5 h-5 text-blue-500" />
                    Search School
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={schoolSearch}
                      onChange={handleSchoolSearch}
                      placeholder="Type school name..."
                      className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  {schoolResults.length > 0 && (
                    <ul className="absolute bg-white border-2 border-gray-200 w-full mt-2 rounded-xl shadow-lg max-h-48 overflow-y-auto z-10">
                      {schoolResults.map((school) => (
                        <li
                          key={school.id}
                          onClick={() => handleSelectSchool(school)}
                          className="p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                        >
                          <div className="flex items-center gap-3">
                            <School className="w-4 h-4 text-blue-500" />
                            {school.schoolName}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {selectedSchool && (
                  <div className="mb-8 p-4 bg-blue-50 rounded-xl border-l-4 border-blue-500">
                    <p className="font-semibold text-gray-700 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Selected School:{" "}
                      <span className="text-blue-600 font-bold">
                        {selectedSchool.schoolName}
                      </span>
                    </p>
                  </div>
                )}

                {/* 🔹 Trainer Search */}
                <div className="mb-8 relative">
                  <label className="block mb-3 font-semibold text-gray-700 flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-500" />
                    Search Trainers
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={trainerSearch}
                      onChange={handleTrainerSearch}
                      placeholder="Type trainer name..."
                      className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    />
                  </div>
                  {trainerResults.length > 0 && (
                    <ul className="absolute bg-white border-2 border-gray-200 w-full mt-2 rounded-xl shadow-lg max-h-48 overflow-y-auto z-10">
                      {trainerResults.map((trainer) => (
                        <li
                          key={trainer.id}
                          onClick={() => handleAddTrainer(trainer)}
                          className="p-4 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                        >
                          <div className="flex items-center gap-3">
                            <Users className="w-4 h-4 text-green-500" />
                            {trainer.name}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* 🔹 Selected Trainers */}
                {selectedTrainers.length > 0 && (
                  <div className="mb-8">
                    <label className="block mb-3 font-semibold text-gray-700">
                      Selected Trainers ({selectedTrainers.length})
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {selectedTrainers.map((trainer) => (
                        <div
                          key={trainer.id}
                          className="flex items-center bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full shadow-sm border border-green-200"
                        >
                          <Users className="w-4 h-4 text-green-600 mr-2" />
                          <span className="text-sm font-medium text-gray-800">
                            {trainer.name}
                          </span>
                          <button
                            onClick={() => handleRemoveTrainer(trainer.id)}
                            className="ml-3 p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-all duration-150"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 🔹 Assign Button */}
                <button
                  onClick={handleAssign}
                  disabled={!selectedSchool || selectedTrainers.length === 0 || isSubmitting}
                  className={`w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform ${
                    !selectedSchool || selectedTrainers.length === 0
                      ? "bg-gray-300 cursor-not-allowed text-gray-500"
                      : isSubmitting
                      ? "bg-blue-400 text-white cursor-wait"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:scale-105 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Assigning Trainers...
                    </div>
                  ) : (
                    `Assign ${selectedTrainers.length} Trainer${
                      selectedTrainers.length !== 1 ? "s" : ""
                    }`
                  )}
                </button>
              </>
            ) : (
              /* 🔹 Assignment Results */
              <div className="space-y-6">
                {assignmentResults.error ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <X className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-red-600 mb-2">
                      Assignment Failed
                    </h3>
                    <p className="text-gray-600">
                      There was an error processing the assignment. Please try
                      again.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="text-center py-6">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        Assignment Complete!
                      </h3>
                      <p className="text-gray-600">
                        {assignmentResults.message}
                      </p>
                    </div>
                      
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-700 mb-3">
                        Detailed Results:
                      </h4>
                      {assignmentResults.results.map((result, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-xl border-l-4 ${
                            result.status === "success"
                              ? "bg-green-50 border-green-500"
                              : result.status === "skipped"
                              ? "bg-yellow-50 border-yellow-500"
                              : "bg-red-50 border-red-500"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {result.status === "success" ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : result.status === "skipped" ? (
                                <AlertCircle className="w-5 h-5 text-yellow-500" />
                              ) : (
                                <X className="w-5 h-5 text-red-500" />
                              )}
                              <div>
                                <p className="font-medium text-gray-800">
                                  {result.trainerName}
                                </p>
                                <p
                                  className={`text-sm ${
                                    result.status === "success"
                                      ? "text-green-600"
                                      : result.status === "skipped"
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {result.message}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                result.status === "success"
                                  ? "bg-green-100 text-green-700"
                                  : result.status === "skipped"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {result.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <button
                  onClick={handleStartOver}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Assign More Trainers
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolAssign;
