/* eslint-disable react-hooks/set-state-in-effect, react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState } from "react"
import { io } from "socket.io-client"
import { useParentAuth } from "./parent-auth"
import parentAPI from "@/api/parent"

const SocketContext = createContext(null)

const SOCKET_URL = "http://localhost:3000"

export function SocketProvider({ children }) {
  const { parentAuth } = useParentAuth()
  const [notifications, setNotifications] = useState([])
  const [messages, setMessages] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const socketRef = useRef(null)

  useEffect(() => {
    if (!parentAuth) {
      setNotifications([])
      setMessages([])
      setUnreadCount(0)
      return
    }
    let active = true
    parentAPI
      .get("/parent/notifications")
      .then((res) => {
        if (!active) return
        const list = res.data?.data?.notifications || []
        setNotifications(list)
        setUnreadCount(list.filter((n) => !n.read).length)
      })
      .catch(() => {})
    parentAPI
      .get("/parent/messages")
      .then((res) => {
        if (!active) return
        setMessages(res.data?.data || [])
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [parentAuth])

  useEffect(() => {
    if (!parentAuth?.token) return
    const socket = io(SOCKET_URL, {
      auth: { token: parentAuth.token },
      transports: ["websocket"],
    })
    socketRef.current = socket

    socket.on("notification:new", (notif) => {
      setNotifications((prev) => [notif, ...prev])
      setUnreadCount((c) => c + 1)
    })
    socket.on("message:new", (msg) => {
      setMessages((prev) => [...prev, msg])
      if (msg.senderType === "school" && !msg.read) {
        setUnreadCount((c) => c + 1)
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [parentAuth?.token])

  function markRead(id) {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    )
    setUnreadCount((c) => Math.max(0, c - 1))
    parentAPI.put(`/parent/notifications/${id}/read`).catch(() => {})
  }

  function markMessageRead(id) {
    setMessages((prev) =>
      prev.map((m) => (m._id === id ? { ...m, read: true } : m))
    )
    setUnreadCount((c) => Math.max(0, c - 1))
    parentAPI.put(`/parent/messages/${id}/read`).catch(() => {})
  }

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setMessages((prev) => prev.map((m) => ({ ...m, read: true })))
    setUnreadCount(0)
    await Promise.all([
      parentAPI.put(`/parent/notifications/read-all`).catch(() => {}),
      parentAPI.put(`/parent/messages/read-all`).catch(() => {}),
    ])
  }

  function deleteMessage(id) {
    setMessages((prev) => prev.filter((m) => m._id !== id))
    setUnreadCount((c) => Math.max(0, c - 1))
    parentAPI.delete(`/parent/messages/${id}`).catch(() => {})
  }

  return (
    <SocketContext.Provider value={{ notifications, messages, unreadCount, markRead, markMessageRead, markAllRead, deleteMessage }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}
