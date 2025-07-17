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

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1>Profile</h1>
      {user && (
        <div>
          <p>ID: {user.pk}</p>
          <p>Username: {user.username}</p>
          <p>Email: {user.email}</p>
        </div>
      )}
      <button onClick={() => router.push('/')}>Back to Home</button>

      <div>
        <button
          onClick={handleLogout}
          className="mt-4 p-2 bg-red-600 text-white rounded-md"
        >
          Logout
        </button>
      </div>
    </div>
  )
}