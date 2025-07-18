"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState({
    username: "",
    password: "",
  });
  const [errorData, setErrorData] = useState<any>(null);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const onLogin = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8000/api/auth/login/', user, {withCredentials: true}); // Allows frontend to send cookies with the request
      setData(response.data);
      router.push('/');
    } catch (error: any) {
      setErrorData(error.response?.data || { detail: "An error occurred during login." });
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.username.length > 0 && user.password.length > 0) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [user]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {loading ? "Processing..." : "Welcome Back"}
        </h1>

        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-600">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-600">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
              placeholder="Enter your password"
            />
          </div>
        </div>

        <button
          onClick={onLogin}
          disabled={buttonDisabled}
          className={`mt-6 w-full py-2 px-4 rounded-md font-semibold text-white transition ${
            buttonDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Login
        </button>

        <div className="mt-4 flex flex-col items-center gap-2 text-sm text-gray-600">
          <Link href="/signup" className="hover:underline text-blue-600">
            Don't have an account? Sign Up
          </Link>
        </div>

      {errorData && (
        <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-md">
          {Object.entries(errorData).map(([key, value], idx) => (
            <p key={idx}>
              <strong>{key}:</strong> {Array.isArray(value) ? value.join(" ") : String(value)}
            </p>
          ))}
        </div>
      )}

      </div>
    </div>
  );
}