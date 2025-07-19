'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

type User = {
  pk: number;
  username: string;
  email: string;
};

export default function Profile() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [errorData, setErrorData] = useState<any>(null)
  const [refresh, setRefresh] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/auth/user/', {
          withCredentials: true,
        })

        setUser(response.data)

      } catch (err) {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleLogout = () => {
    axios
      .post(
        "http://localhost:8000/api/auth/logout/",
        { refresh: refresh },
        {
          withCredentials: true,
        }
      )
      .then(() => {
        router.push("/login")
      })
      .catch((err) => {
        console.error("Logout error:", err)
        setErrorData(err?.response?.data)
        router.push("/login")
      })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">User Profile</h1>
          {user && (
            <p className="text-sm text-gray-600">
              Manage your account settings
            </p>
          )}
        </div>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Back to Chat
        </button>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          {/* Profile Card */}
          <div className="bg-white shadow-lg rounded-xl p-8 mb-6">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-white">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome, {user?.username}!
              </h2>
              <p className="text-gray-600">Here's your account information</p>
            </div>

            <div className="space-y-6">
              {/* User Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">User ID</p>
                      <p className="text-lg font-semibold text-gray-800">#{user?.pk}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-bold">ID</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Username</p>
                      <p className="text-lg font-semibold text-gray-800">{user?.username}</p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm font-bold">@</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email Address</p>
                    <p className="text-lg font-semibold text-gray-800">{user?.email}</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-sm font-bold">@</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push('/')}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-semibold"
              >
                Continue Chatting
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-semibold"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Additional Info Card */}
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Account Status</h3>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-green-800">Account Active</p>
                  <p className="text-sm text-green-600">Your account is verified and ready to use</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorData && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {errorData.detail || "An error occurred."}
        </div>
      )}
    </div>
  )
}