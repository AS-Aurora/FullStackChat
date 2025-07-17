"use client";

import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const [status, setStatus] = useState("");

  useEffect(() => {
    const key = params.get("key");
    if (key) {
      axios
        .post("http://localhost:8000/api/auth/registration/verify-email/", {
          key,
        })
        .then((response) => {
          setStatus("Email verified successfully!");
        })
        .catch((error) => {
          setStatus("Error verifying email.");
        });
    } else {
      setStatus("No verification key provided.");
    }
  }, [params]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Email Verification</h1>
        <p
          className={`text-base font-medium ${
            status.toLowerCase().includes("success")
              ? "text-green-600"
              : status.toLowerCase().includes("fail") || status.toLowerCase().includes("error")
              ? "text-red-600"
              : "text-gray-600"
          }`}
        >
          {status}
        </p>
      </div>
    </div>
  );
}
