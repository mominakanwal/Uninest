import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully");
      navigate("/home");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-500 to-black">
      <form
        onSubmit={handleLogin}
        className="bg-white p-10 rounded-xl shadow-md w-full max-w-md transition-all duration-300"
        autoComplete="off"
      >
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Login to Uninest
        </h2>

        <div className="mb-4">
          <label className="text-sm text-gray-600 block mb-1">Email</label>
          <input
            type="email"
            placeholder="example@mail.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            autoComplete="new-email"
          />
        </div>

        <div className="mb-4">
          <label className="text-sm text-gray-600 block mb-1">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-md w-full font-semibold transition-colors"
        >
          Login
        </button>

        <p className="text-center text-sm mt-5 text-gray-600">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
