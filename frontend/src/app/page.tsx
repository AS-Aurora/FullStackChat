"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Home() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorData, setErrorData] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [input, setInput] = useState("");
  const router = useRouter();

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/auth/user/", {
        withCredentials: true,
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

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000/ws/chat/");
    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      const message = {
        id: data.uuid,
        user: data.username,
        text: data.message,
        timestamp: data.timestamp,
      };
      setMessages((prev) => [...prev, message]);
    };

    setSocket(socket);

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  const sendMessage = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ message: input }));
      setInput("");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-2xl font-bold mb-2 text-center text-gray-800">
          {loading ? "Loading..." : `Welcome, ${userData?.username || "User"}!`}
        </h1>
        <p className="text-center text-gray-600 mb-4">
          This is your protected home page.
        </p>

        {errorData && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-md">
            <p>Error: {errorData.detail || "An error occurred."}</p>
          </div>
        )}

        <div className="flex justify-center mb-6">
          <button
            onClick={() => router.push(`/profile/${userData?.pk}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Go to Profile
          </button>
        </div>

        <div className="mb-4 max-h-40 overflow-y-auto space-y-2">
          {messages.map((msg, idx) => (
            <div
              key={msg.id}
              className="bg-gray-100 border border-gray-300 rounded p-2 text-sm text-gray-800"
            >
              <div className="font-semibold text-blue-700">{msg.user}</div>
              <div>{msg.text}</div>
              <div className="text-xs text-gray-500">{msg.timestamp}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
            placeholder="Type your message..."
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
