"use client"

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Home() {

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorData, setErrorData] = useState<any>(null);
  const router = useRouter();

    useEffect(() => {
    axios
      .get("http://localhost:8000/api/auth/user/", {
        withCredentials: true, // This sends cookies to the backend
      })
      .then((res) => {
        setUserData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setErrorData(err?.response?.data);
        router.push("/login");
      });
  }, []);
  return (
    <div>
      {loading && <p>Loading...</p>}
      {errorData && <p>Error: {errorData.detail}</p>}
      {userData && (
        <div>
          <h1>Welcome, {userData.username}!</h1>
        </div>
      )}
      {!loading && !errorData && !userData && (
        <p>No user data available.</p>
      )}
      <button onClick={() => router.push(`/profile/${userData.pk}`)}>Go to Profile</button>
    </div>
  );
}
