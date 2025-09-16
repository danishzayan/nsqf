import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // ✅ import axios
import schoolLogo from "../assets/school.png";
import loginIllustration from "../assets/schoolimage.png";

const Login = ({ setRole }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:3000/api/companyadmins/login", {
        email,
        password,
      });

      // Axios automatically parses JSON
      console.log("Login response:", res.user);
      console.log("Response data:", res.data.user.role);
      const token = res.data.token;
      const role = res.data.user.role;
      // const { token, role } = res.data;
      if (!token || !role) {
        setError("⚠ Invalid response from server");
        return;
      }
      console.log("Login successful, token:", token, "role:", role);

      // Save token & role
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      setRole(role); // update parent state
      navigate("/dashboard");
    } catch (err) {
      // If backend sends 400/404, it comes in err.response
      if (err.response) {
        setError(err.response.data.message || "⚠ Access Denied");
      } else {
        setError("⚠ Server error, please try again");
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-black text-green-400 font-['Orbitron']">
      {/* Left Side Illustration */}
      <div className="hidden md:flex w-1/2 relative overflow-hidden">
        <img
          src={loginIllustration}
          alt="Login Illustration"
          className="w-full h-full object-cover opacity-40 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/70 to-black"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-10">
          <img
            src={schoolLogo}
            alt="School Logo"
            className="w-24 h-24 mb-4 drop-shadow-lg"
          />
          <h1 className="text-4xl font-bold mb-3 text-green-300 tracking-wider">
            NSQF Access Portal
          </h1>
          <p className="max-w-sm text-green-500 text-sm opacity-80">
            [Encrypted Gateway] Authorized personnel only. All activities
            monitored.
          </p>
        </div>
      </div>

      {/* Right Side Login */}
      <div
        className={`flex w-full md:w-1/2 justify-center items-center p-6 md:p-12 transition-all duration-700 ${
          animate ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
        }`}
      >
        <div className="w-full max-w-md bg-black/80 backdrop-blur-md border border-green-700 rounded-2xl shadow-xl p-8 animate-fadeUp">
          <h2 className="text-2xl font-bold text-green-300 mb-6">System Login</h2>

          {error && (
            <p className="text-red-500 text-sm text-center mb-3">{error}</p>
          )}

          <label className="block text-green-400 text-sm mb-1">Email</label>
          <input
            type="email"
            className="w-full p-3 mb-4 rounded-lg bg-black border border-green-600 text-green-300 placeholder-green-500 focus:outline-none focus:ring-2 focus:ring-green-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@domain.com"
          />

          <label className="block text-green-400 text-sm mb-1">Password</label>
          <input
            type="password"
            className="w-full p-3 mb-6 rounded-lg bg-black border border-green-600 text-green-300 placeholder-green-500 focus:outline-none focus:ring-2 focus:ring-green-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <button
            onClick={handleLogin}
            className="w-full bg-green-500 text-black py-3 rounded-lg font-semibold shadow-lg hover:bg-green-400 hover:scale-101 transform transition-all duration-300"
          >
            ➤ ACCESS
          </button>

          <p className="text-center text-xs text-green-500 mt-4 opacity-70">
            © {new Date().getFullYear()} NSQF Secure Portal. Unauthorized access
            prohibited.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
