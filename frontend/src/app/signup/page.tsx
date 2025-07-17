"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function SignUpPage() {
  const router = useRouter();
  const [user, setUser] = useState({
    username: "",
    email: "",
    password1: "",
    password2: ""
  });
  const [data, setData] = useState<{ detail?: string; [key: string]: any }>({});
  const [errorData, setErrorData] = useState<any>(null);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSignUp = async () => {
    try {
      setLoading(true);
      setErrorData(null);
      const response = await axios.post('http://localhost:8000/api/auth/registration/', user);
      setData(response.data);
      setTimeout(() => {
        router.push("/login");
      }, 5000) // Redirect after 5 seconds
      if(response.data.success) {
        router.push("/login");
      }
    } catch (error: any) {
      setLoading(false);
      setErrorData(error.response?.data || { detail: "An error occurred during registration." });
    }
  };

  useEffect(() => {
    if(user.email.length > 0 && user.username.length > 0 && user.password1.length > 0 && user.password2.length > 0 && user.password1 === user.password2) {
      setButtonDisabled(false)
    } else {
      setButtonDisabled(true)
    }
  }, [user]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {loading ? "Processing..." : "Create an Account"}
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
            <label htmlFor="email" className="block text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
              placeholder="Enter your email address"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-600">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={user.password1}
              onChange={(e) => setUser({ ...user, password1: e.target.value })}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
              placeholder="Enter your password"
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-600">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={user.password2}
              onChange={(e)=>setUser({...user, password2: e.target.value })}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
              placeholder="Re-enter your password"
            />
          </div>
        </div>

        <button
          onClick={onSignUp}
          disabled={buttonDisabled}
          className={`mt-6 w-full py-2 px-4 rounded-md font-semibold text-white transition ${
            buttonDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
            Signup
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>

         {data && data.detail && (
        <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-md">
          <p>{data.detail}</p>
        </div>
      )}

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
