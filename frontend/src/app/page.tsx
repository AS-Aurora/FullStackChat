"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface OnlineUsers {
  count: number
  users: string[]
}

export default function Home() {
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [errorData, setErrorData] = useState<any>(null)
  const [rooms, setRooms] = useState<any[]>([])
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [input, setInput] = useState("")
  const [newRoomName, setNewRoomName] = useState("")
  const [onlineUsers, setOnlineUsers] = useState<OnlineUsers>({ count: 0, users: [] })
  const router = useRouter()

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/auth/user/", {
        withCredentials: true,
      })
      .then((res) => {
        setUserData(res.data)
        setLoading(false)
        fetchRooms()
      })
      .catch((err) => {
        setErrorData(err?.response?.data)
        router.push("/login")
      })
  }, [])

  const fetchRooms = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/chat/rooms/", {
        withCredentials: true,
      })
      setRooms(response.data)
    } catch (error) {
      console.error("Error fetching rooms:", error)
    }
  }

  const createRoom = async () => {
    if (!newRoomName.trim()) return

    try {
      const response = await axios.post(
        "http://localhost:8000/api/chat/rooms/",
        { name: newRoomName },
        { withCredentials: true }
      )
      setRooms([response.data, ...rooms])
      setNewRoomName("")
    } catch (error) {
      console.error("Error creating room:", error)
    }
  }

  const joinRoom = async (roomId: string) => {
    if (socket) {
      socket.close()
    }

    try {
      const response = await axios.get(
        `http://localhost:8000/api/chat/rooms/${roomId}/`,
        { withCredentials: true }
      )
      setMessages(response.data.messages || [])
      setOnlineUsers(response.data.online_users || { count: 0, users: [] })
    } catch (error) {
      console.error("Error fetching room messages:", error)
      setMessages([])
      setOnlineUsers({ count: 0, users: [] })
    }

    const newSocket = new WebSocket(`ws://localhost:8000/ws/chat/${roomId}/`)

    newSocket.onopen = () => {
      console.log(`Connected to room ${roomId}`)
      setSelectedRoom(roomId)
      setSocket(newSocket)
    }

    newSocket.onmessage = (e) => {
  const data = JSON.parse(e.data)
  console.log("Received WebSocket data:", data)

  if (data.type === 'message' || (data.message && data.username && data.uuid)) {
    console.log("Adding message to UI:", data)
    const message = {
      id: data.uuid,
      sender_username: data.username,
      content: data.message,
      timestamp: data.timestamp,
    }
    setMessages((prev) => [...prev, message])
  } else if (data.type === 'online_users') {
    setOnlineUsers({
      count: data.count,
      users: data.users
    })
  }
}

    newSocket.onclose = () => {
      console.log(`Disconnected from room ${roomId}`)
      setOnlineUsers({ count: 0, users: [] })
    }

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error)
    }
  }

  const sendMessage = () => {
    if (socket && socket.readyState === WebSocket.OPEN && input.trim()) {
      socket.send(JSON.stringify({ message: input.trim() }))
      setInput("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-white shadow-lg">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Chat Rooms</h2>
          <div className="mt-2">
            <input
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm text-black"
              placeholder="New room name..."
              onKeyPress={(e) => e.key === 'Enter' && createRoom()}
            />
            <button
              onClick={createRoom}
              className="w-full mt-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
            >
              Create Room
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto h-full">
          {rooms.map((room) => (
            <div
              key={room.id}
              onClick={() => joinRoom(room.id)}
              className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                selectedRoom === room.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="font-medium text-gray-800">{room.name}</div>
              </div>
              <div className="text-xs text-gray-500">
                Created: {new Date(room.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow-sm border-b p-4 flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-800">
                {selectedRoom ? `Room: ${rooms.find(r => r.id === selectedRoom)?.name || 'Unknown'}` : 'Select a room to start chatting'}
              </h1>
              {selectedRoom && (
                <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-700 font-medium">
                    {onlineUsers.count} online
                  </span>
                </div>
              )}
            </div>
            {userData && (
              <p className="text-sm text-gray-600">
                Welcome, {userData.username}!
              </p>
            )}
          </div>
          <button
            onClick={() => router.push(`/profile/${userData?.pk}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Profile
          </button>
        </div>

        {selectedRoom ? (
          <div className="flex flex-1 overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_username === userData?.username ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.sender_username === userData?.username
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300'
                      }`}
                    >
                      <div className={`font-semibold text-sm ${
                        msg.sender_username === userData?.username ? 'text-blue-100' : 'text-blue-700'
                      }`}>
                        {msg.sender_username}
                      </div>
                      <div className={`${
                        msg.sender_username === userData?.username ? 'text-white-100' : 'text-black'
                      }`}>{msg.content}</div>
                      <div className={`text-xs mt-1 ${
                        msg.sender_username === userData?.username ? 'text-blue-200' : 'text-gray-500'
                      }`}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="bg-white border-t p-4">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                    placeholder="Type your message..."
                  />
                  <button
                    onClick={sendMessage}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>

            {/* Online Users Sidebar */}
            <div className="w-64 bg-white border-l border-gray-200">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-800">Online Users ({onlineUsers.count})</h3>
              </div>
              <div className="p-4 space-y-2 overflow-y-auto">
                {onlineUsers.users.length > 0 ? (
                  onlineUsers.users.map((username, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className={`text-sm ${username === userData?.username ? 'font-semibold text-blue-600' : 'text-gray-700'}`}>
                        {username} {username === userData?.username ? '(You)' : ''}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No users online</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-xl">Welcome to the Chat App!</p>
              <p>Select a room from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {errorData && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {errorData.detail || "An error occurred."}
        </div>
      )}
    </div>
  )
}