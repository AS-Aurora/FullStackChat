"use client"

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Home() {

  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [errorData, setErrorData] = useState<any>(null)
  const router = useRouter()

    useEffect(() => {
    axios
      .get("http://localhost:8000/api/auth/user/", {
        withCredentials: true, // This sends cookies to the backend
      })
      .then((res) => {
        setUserData(res.data)
        setLoading(false)
      })
      .catch((err) => {
        setErrorData(err?.response?.data)
        router.push("/login")
      })
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold">
        Welcome, {userData?.username || "User"}!
      </h1>
      <p className="mt-2 text-gray-600">This is your protected home page.</p>

      {errorData && (
        <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-md">
          <p>Error: {errorData.detail || "An error occurred."}</p>
        </div>
      )}

      <div className="mt-4">
        <button
          onClick={() => router.push(`/profile/${userData?.pk}`)}
          className="p-2 bg-blue-600 text-white rounded-md"
        >
          Go to Profile
        </button>
      </div>
    </div>
  );
}
