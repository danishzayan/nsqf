import React, { useState } from "react";
import { User, Mail, Lock, Phone } from "lucide-react"; // optional icons

const Registration = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "trainer",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/v1/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setMessage("✅ Registration successful!");
        setFormData({ name: "", email: "", password: "", phone: "", role: "trainer" });
      } else {
        const data = await res.json();
        setMessage(`❌ Error: ${data.message || "Something went wrong"}`);
      }
    } catch (error) {
      setMessage("❌ Server not reachable");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-500">
      <div className="bg-white/70 backdrop-blur-lg shadow-2xl rounded-3xl p-10 w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center mb-8 text-gray-800 drop-shadow-md">
          Create Account
        </h2>

        {message && (
          <div className="mb-6 text-center text-sm font-medium text-red-600">{message}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full pl-10 border border-gray-300 rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-500"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-10 border border-gray-300 rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-500"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full pl-10 border border-gray-300 rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-500"
            />
          </div>

          {/* Phone */}
          <div className="relative">
            <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full pl-10 border border-gray-300 rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-500"
            />
          </div>

          {/* Role */}
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-xl py-3 px-3 focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-600"
          >
            <option value="trainer">Trainer</option>
            <option value="student">Coordinator</option>
          </select>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white font-semibold py-3 rounded-xl hover:bg-purple-700 transition-all duration-300 shadow-md"
          >
            Register
          </button>
        </form>

        {/* <p className="text-center mt-6 text-gray-700">
          Already have an account? <a href="/login" className="text-purple-600 font-semibold hover:underline">Login</a>
        </p> */}
      </div>
    </div>
  );
};

export default Registration;
